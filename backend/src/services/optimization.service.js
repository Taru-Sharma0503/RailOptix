const optimizationRunRepo = require('../repositories/optimizationRun.repository');
const maintenanceRepo = require('../repositories/maintenance.repository');
const blockRepo = require('../repositories/block.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const assetRepo = require('../repositories/asset.repository');
const conflictRepo = require('../repositories/conflict.repository');
const { query } = require('../config/db');
const { NotFoundError } = require('../utils/errors');
const { successResponse, nextSequentialId, timeToMinutes, minutesToTime, timesOverlap, clamp } = require('../utils/helpers');

let io = null;
function setSocketIO(socketInstance) {
  io = socketInstance;
}

class OptimizationService {
  async startOptimization({ corridorId, planningDate, maintenanceTaskIds, blockIds, objective }) {
    const runId = await nextSequentialId('OPT', () => optimizationRunRepo.count());

    const run = await optimizationRunRepo.create({
      id: runId,
      corridorId,
      planningDate,
      status: 'queued',
      message: 'Optimization queued',
      objective: objective || { assetAvailability: 0.35, trainDisruption: 0.30, conflicts: 0.15, blockWastage: 0.10, safetyRisk: 0.10 },
      taskIds: maintenanceTaskIds,
      blockIds,
    });

    this._runOptimizationAsync(runId, { corridorId, planningDate, maintenanceTaskIds, blockIds, objective }).catch((err) => {
      console.error(`Optimization ${runId} failed:`, err.message);
      optimizationRunRepo.update(runId, {
        status: 'failed',
        message: err.message,
        completedAt: new Date(),
      });
      if (io) io.emit('optimization:failed', { runId, error: err.message });
    });

    return { success: true, runId, status: 'queued' };
  }

  async _runOptimizationAsync(runId, params) {
    const emit = (progress, message) => {
      optimizationRunRepo.update(runId, { progress, message, status: progress < 100 ? 'running' : 'completed' });
      if (io) io.emit('optimization:progress', { runId, progress, message });
    };

    emit(5, 'Loading maintenance tasks');

    const tasks = [];
    for (const tid of params.maintenanceTaskIds) {
      const t = await maintenanceRepo.findById(tid);
      if (t) tasks.push(t);
    }

    emit(15, 'Loading candidate blocks');
    const blocks = [];
    for (const bid of params.blockIds) {
      const b = await blockRepo.findById(bid);
      if (b) blocks.push(b);
    }

    emit(25, 'Loading train schedules');
    const trainSchedules = await trainScheduleRepo.findWithFilters({
      corridorId: params.corridorId,
      date: params.planningDate,
    });

    emit(35, 'Checking conflicts');
    const conflicts = await conflictRepo.findWithFilters({ corridorId: params.corridorId, status: 'open' });

    emit(45, 'Checking maintenance deadlines');
    const deadlineIssues = tasks.filter((t) => {
      if (!t.deadline) return false;
      const daysLeft = (new Date(t.deadline) - new Date(params.planningDate)) / (1000 * 60 * 60 * 24);
      return daysLeft < 0;
    });

    emit(55, 'Evaluating safety constraints');
    const safetyIssues = tasks.filter((t) => t.safetyRisk >= 8);

    emit(65, 'Generating candidate schedules');

    const candidates = this._generateCandidates(tasks, blocks, trainSchedules, params.objective);

    emit(80, 'Scoring candidate schedules');
    let bestCandidate = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = this._scoreCandidate(candidate, params.objective, trainSchedules, tasks);
      candidate.totalScore = score;
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    emit(90, 'Selecting optimal schedule');
    if (!bestCandidate) {
      bestCandidate = {
        schedule: tasks.map((t) => ({
          maintenanceTaskId: t.id,
          blockId: blocks[0] ? blocks[0].id : null,
          start: blocks[0] ? blocks[0].start : '09:00',
          end: blocks[0] ? minutesToTime(timeToMinutes(blocks[0].start) + t.estimatedDuration) : '12:00',
          score: 0,
          estimatedDuration: t.estimatedDuration,
        })),
        metrics: this._calculateMetrics(tasks, blocks, [], trainSchedules),
        explanations: [{ factor: 'Default schedule', impact: 'neutral', score: 0 }],
      };
    }

    emit(95, 'Storing optimization result');

    const result = {
      schedule: bestCandidate.schedule,
      metrics: bestCandidate.metrics,
      explanation: this._generateExplanation(bestCandidate, params.objective, tasks, trainSchedules, conflicts),
    };

    await optimizationRunRepo.update(runId, {
      status: 'completed',
      progress: 100,
      message: 'Optimization completed successfully',
      result,
      completedAt: new Date(),
    });

    if (io) io.emit('optimization:completed', { runId, result });
  }

  _generateCandidates(tasks, blocks, trainSchedules, objective) {
    if (blocks.length === 0 || tasks.length === 0) return [];

    const candidates = [];
    const maxCandidates = 20;

    const sortedTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore || b.severity - a.severity);

    const blockOrderings = this._generateBlockOrderings(blocks, Math.min(maxCandidates, 6));

    for (let bi = 0; bi < blockOrderings.length; bi++) {
      const blockOrder = blockOrderings[bi];
      const schedule = [];
      let currentBlockIdx = 0;
      let currentBlock = blockOrder[0];
      let cursorInBlock = timeToMinutes(currentBlock.start);

      for (const task of sortedTasks) {
        let placed = false;
        for (let attempt = 0; attempt < blockOrder.length; attempt++) {
          const blockIdx = (currentBlockIdx + attempt) % blockOrder.length;
          const block = blockOrder[blockIdx];
          const blockStart = timeToMinutes(block.start);
          const blockEnd = timeToMinutes(block.end);

          let startTime = blockIdx === currentBlockIdx ? cursorInBlock : blockStart;
          if (startTime + task.estimatedDuration <= blockEnd) {
            const endTime = startTime + task.estimatedDuration;
            schedule.push({
              maintenanceTaskId: task.id,
              blockId: block.id,
              start: minutesToTime(startTime),
              end: minutesToTime(endTime),
              score: task.priorityScore,
              estimatedDuration: task.estimatedDuration,
            });
            cursorInBlock = endTime;
            currentBlockIdx = blockIdx;
            currentBlock = block;
            placed = true;
            break;
          }
        }

        if (!placed) {
          schedule.push({
            maintenanceTaskId: task.id,
            blockId: currentBlock.id,
            start: currentBlock.start,
            end: currentBlock.end,
            score: task.priorityScore * 0.5,
            estimatedDuration: task.estimatedDuration,
            unplaced: true,
          });
        }
      }

      const metrics = this._calculateMetrics(sortedTasks, blocks, schedule, trainSchedules);
      candidates.push({ schedule, metrics, blockOrderIndex: bi });
    }

    return candidates;
  }

  _generateBlockOrderings(blocks, count) {
    const orderings = [blocks];
    const shuffled = [...blocks].reverse();
    orderings.push(shuffled);

    for (let i = 0; i < count - 2 && i < blocks.length; i++) {
      const rotated = [...blocks.slice(i), ...blocks.slice(0, i)];
      orderings.push(rotated);
    }

    return orderings;
  }

  _scoreCandidate(candidate, objective, trainSchedules, tasks) {
    const m = candidate.metrics;
    const w = objective || { assetAvailability: 0.35, trainDisruption: 0.30, conflicts: 0.15, blockWastage: 0.10, safetyRisk: 0.10 };

    const availabilityScore = m.assetAvailability / 100;
    const disruptionScore = 1 - clamp(m.expectedTrainDelay / 60, 0, 1);
    const conflictScore = 1 - clamp(m.conflicts / 10, 0, 1);
    const utilizationScore = m.blockUtilization / 100;
    const safetyScore = 1 - m.operationalRisk;

    return (
      availabilityScore * w.assetAvailability +
      disruptionScore * w.trainDisruption +
      conflictScore * w.conflicts +
      utilizationScore * w.blockWastage +
      safetyScore * w.safetyRisk
    );
  }

  _calculateMetrics(tasks, blocks, schedule, trainSchedules) {
    const scheduledTasks = schedule.filter((s) => !s.unplaced);
    const assetAvailability = tasks.length > 0
      ? parseFloat(((scheduledTasks.length / tasks.length) * 100).toFixed(1))
      : 100;

    let affectedTrains = 0;
    let totalDelay = 0;
    for (const s of schedule) {
      for (const ts of trainSchedules) {
        if (timesOverlap(s.start, s.end, ts.arrivalTime, ts.departureTime)) {
          affectedTrains++;
          totalDelay += Math.min(s.estimatedDuration || 30, 45);
        }
      }
    }
    const expectedTrainDelay = affectedTrains > 0 ? Math.round(totalDelay / Math.max(affectedTrains, 1)) : 0;

    let conflicts = 0;
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        if (schedule[i].blockId === schedule[j].blockId &&
          timesOverlap(schedule[i].start, schedule[i].end, schedule[j].start, schedule[j].end)) {
          conflicts++;
        }
      }
    }

    const totalBlockTime = blocks.reduce((sum, b) => sum + (timeToMinutes(b.end) - timeToMinutes(b.start)), 0);
    const usedTime = schedule.reduce((sum, s) => sum + (timeToMinutes(s.end) - timeToMinutes(s.start)), 0);
    const blockUtilization = totalBlockTime > 0 ? parseFloat(((usedTime / totalBlockTime) * 100).toFixed(1)) : 0;

    const avgSafetyRisk = tasks.length > 0
      ? tasks.reduce((sum, t) => sum + (t.safetyRisk || 5), 0) / tasks.length
      : 5;
    const operationalRisk = parseFloat(clamp(avgSafetyRisk / 10, 0, 1).toFixed(2));

    return {
      assetAvailability,
      expectedTrainDelay,
      conflicts,
      blockUtilization,
      operationalRisk,
    };
  }

  _generateExplanation(candidate, objective, tasks, trainSchedules, conflicts) {
    const m = candidate.metrics;
    const w = objective || { assetAvailability: 0.35, trainDisruption: 0.30, conflicts: 0.15, blockWastage: 0.10, safetyRisk: 0.10 };

    const explanations = [];

    const highCriticalityTasks = tasks.filter((t) => (t.assetCriticality || 5) >= 7).length;
    explanations.push({
      factor: 'Asset criticality',
      impact: highCriticalityTasks > tasks.length / 2 ? 'positive' : 'neutral',
      score: Math.round(highCriticalityTasks * w.assetAvailability * 100 / Math.max(tasks.length, 1)),
    });

    const trainTrafficFactor = trainSchedules.length;
    explanations.push({
      factor: 'Train traffic',
      impact: trainTrafficFactor > 8 ? 'negative' : 'positive',
      score: Math.round((1 - clamp(trainTrafficFactor / 20, 0, 1)) * w.trainDisruption * 100 - (m.expectedTrainDelay > 10 ? 10 : 0)),
    });

    const avgSafety = tasks.length > 0 ? tasks.reduce((s, t) => s + (t.safetyRisk || 5), 0) / tasks.length : 5;
    explanations.push({
      factor: 'Safety constraints',
      impact: avgSafety < 7 ? 'positive' : 'negative',
      score: Math.round((1 - avgSafety / 10) * w.safetyRisk * 100),
    });

    const disruptionImpact = m.expectedTrainDelay > 15 ? -Math.round(m.expectedTrainDelay * 0.5) : Math.round((1 - m.expectedTrainDelay / 60) * 10);
    explanations.push({
      factor: 'Passenger disruption',
      impact: disruptionImpact < 0 ? 'negative' : 'positive',
      score: disruptionImpact,
    });

    if (m.blockUtilization > 85) {
      explanations.push({
        factor: 'Block utilization',
        impact: 'positive',
        score: Math.round(w.blockWastage * 100 * 0.8),
      });
    } else if (m.blockUtilization < 50) {
      explanations.push({
        factor: 'Block utilization',
        impact: 'negative',
        score: -Math.round(w.blockWastage * 100 * 0.3),
      });
    }

    if (m.conflicts === 0) {
      explanations.push({
        factor: 'Conflict avoidance',
        impact: 'positive',
        score: Math.round(w.conflicts * 100),
      });
    } else {
      explanations.push({
        factor: 'Conflict avoidance',
        impact: 'negative',
        score: -Math.round(m.conflicts * 5),
      });
    }

    return explanations;
  }

  async getStatus(runId) {
    const run = await optimizationRunRepo.findById(runId);
    if (!run) throw NotFoundError.resource('Optimization run');
    return {
      success: true,
      runId: run.id,
      status: run.status,
      progress: run.progress,
      message: run.message,
    };
  }

  async getResult(runId) {
    const run = await optimizationRunRepo.findById(runId);
    if (!run) throw NotFoundError.resource('Optimization run');
    if (run.status !== 'completed') {
      return {
        success: true,
        runId: run.id,
        status: run.status,
        message: run.status === 'failed' ? run.message : 'Optimization is still running',
      };
    }
    return {
      success: true,
      runId: run.id,
      status: run.status,
      schedule: run.result.schedule,
      metrics: run.result.metrics,
    };
  }

  async getExplanation(runId) {
    const run = await optimizationRunRepo.findById(runId);
    if (!run) throw NotFoundError.resource('Optimization run');
    if (run.status !== 'completed' || !run.result) {
      return {
        success: true,
        runId: run.id,
        status: run.status,
        whyOptimal: [],
      };
    }
    return {
      success: true,
      runId: run.id,
      whyOptimal: run.result.explanation || [],
    };
  }
}

module.exports = { instance: new OptimizationService(), setSocketIO };