const simRepo = require('../repositories/simulation.repository');
const maintenanceRepo = require('../repositories/maintenance.repository');
const blockRepo = require('../repositories/block.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const assetRepo = require('../repositories/asset.repository');
const conflictRepo = require('../repositories/conflict.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse, generateId, timeToMinutes, minutesToTime, timesOverlap, clamp } = require('../utils/helpers');

let io = null;
function setSocketIO(socketInstance) {
  io = socketInstance;
}

class SimulationService {
  async createScenario({ corridorId, block, maintenanceTaskIds, trainScheduleDate }) {
    const count = await this._countScenarios();
    const id = generateId('SIM', count + 1);

    const scenario = await simRepo.createScenario({
      id,
      corridorId,
      blockConfig: block,
      maintenanceTaskIds,
      trainScheduleDate,
      status: 'created',
    });

    return { success: true, scenarioId: id, status: 'created' };
  }

  async runScenario(id) {
    const scenario = await simRepo.findScenarioById(id);
    if (!scenario) throw NotFoundError.resource('Simulation scenario');

    await simRepo.updateScenario(id, { status: 'queued' });

    this._runSimulationAsync(id, scenario).catch((err) => {
      console.error(`Simulation ${id} failed:`, err.message);
      simRepo.updateScenario(id, { status: 'failed' });
      if (io) io.emit('simulation:failed', { scenarioId: id, error: err.message });
    });

    return { success: true, scenarioId: id, status: 'queued' };
  }

  async _runSimulationAsync(id, scenario) {
    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 10, message: 'Loading scenario data' });

    const block = scenario.blockConfig;
    const blockStart = timeToMinutes(block.start);
    const blockEnd = timeToMinutes(block.end);

    const trainSchedules = await trainScheduleRepo.findWithFilters({
      corridorId: scenario.corridorId,
      date: scenario.trainScheduleDate,
    });

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 30, message: 'Analyzing train impacts' });

    const affectedTrains = [];
    for (const ts of trainSchedules) {
      const tsStart = timeToMinutes(ts.arrivalTime);
      const tsEnd = timeToMinutes(ts.departureTime);
      if (blockStart < tsEnd && tsStart < blockEnd) {
        const overlapStart = Math.max(blockStart, tsStart);
        const overlapEnd = Math.min(blockEnd, tsEnd);
        const delayMinutes = Math.min(overlapEnd - overlapStart, 45);
        affectedTrains.push({
          trainId: ts.trainId,
          trainName: ts.trainName,
          trainNumber: ts.trainNumber,
          trainType: ts.trainType,
          priority: ts.trainPriority,
          arrivalTime: ts.arrivalTime,
          departureTime: ts.departureTime,
          expectedDelay: delayMinutes,
        });
      }
    }

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 50, message: 'Analyzing asset impacts' });

    const affectedAssets = [];
    for (const taskId of scenario.maintenanceTaskIds) {
      const task = await maintenanceRepo.findById(taskId);
      if (task) {
        const asset = await assetRepo.findById(task.assetId);
        if (asset) {
          affectedAssets.push({
            assetId: asset.id,
            assetName: asset.name,
            assetType: asset.type,
            condition: asset.condition,
            criticality: asset.criticality,
            maintenanceTask: task.description,
          });
        }
      }
    }

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 70, message: 'Checking conflicts' });

    const existingBlocks = await blockRepo.findByCorridorAndDate(scenario.corridorId, scenario.trainScheduleDate);
    const conflicts = [];
    for (const eb of existingBlocks) {
      if (timesOverlap(block.start, block.end, eb.start, eb.end)) {
        conflicts.push({
          blockId: eb.id,
          departmentId: eb.departmentId,
          start: eb.start,
          end: eb.end,
          reason: eb.reason,
          conflictType: 'time_overlap',
        });
      }
    }

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 80, message: 'Calculating metrics' });

    const totalAssetsInCorridor = await assetRepo.findWithFilters({ corridorId: scenario.corridorId });
    const infrastructureAvailability = totalAssetsInCorridor.length > 0
      ? parseFloat(((1 - affectedAssets.length / totalAssetsInCorridor.length) * 100).toFixed(1))
      : 100;

    const blockDuration = blockEnd - blockStart;
    const blockUtilization = parseFloat(clamp((scenario.maintenanceTaskIds.length * 60 / blockDuration) * 100, 0, 100).toFixed(1));

    const expectedDelay = affectedTrains.length > 0
      ? Math.round(affectedTrains.reduce((s, t) => s + t.expectedDelay, 0) / affectedTrains.length)
      : 0;

    const risk = parseFloat(clamp(
      (affectedTrains.length * 0.03) + (affectedAssets.filter(a => a.criticality >= 8).length * 0.05) + (conflicts.length * 0.04),
      0, 1
    ).toFixed(2));

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 90, message: 'Finding alternative blocks' });

    const alternativeBlocks = await this._findAlternativeBlocks(scenario.corridorId, scenario.trainScheduleDate, blockDuration, block.start, block.end);

    if (io) io.emit('simulation:progress', { scenarioId: id, progress: 100, message: 'Simulation completed' });

    const resultCount = await this._countResults();
    const result = await simRepo.createResult({
      id: generateId('SIMR', resultCount + 1),
      simulationId: id,
      affectedTrains,
      expectedDelay,
      affectedAssets,
      infrastructureAvailability,
      conflicts,
      blockUtilization,
      risk,
      alternativeBlocks,
    });

    await simRepo.updateScenario(id, { status: 'completed' });

    if (io) io.emit('simulation:completed', { scenarioId: id, result });
  }

  async _findAlternativeBlocks(corridorId, date, requiredDuration, avoidStart, avoidEnd) {
    const existingBlocks = await blockRepo.findByCorridorAndDate(corridorId, date);
    const trainSchedules = await trainScheduleRepo.findWithFilters({ corridorId, date });

    const blockedRanges = [
      ...existingBlocks.map((b) => ({ start: timeToMinutes(b.start), end: timeToMinutes(b.end) })),
      ...trainSchedules.map((t) => ({ start: timeToMinutes(t.arrivalTime), end: timeToMinutes(t.departureTime) + 15 })),
      { start: timeToMinutes(avoidStart), end: timeToMinutes(avoidEnd) },
    ].sort((a, b) => a.start - b.start);

    const alternatives = [];
    let cursor = 0;
    const dayEnd = 1440;

    for (const range of blockedRanges) {
      if (range.start - cursor >= requiredDuration) {
        alternatives.push({
          start: minutesToTime(cursor),
          end: minutesToTime(cursor + requiredDuration),
          duration: requiredDuration,
          conflictFree: true,
        });
      }
      cursor = Math.max(cursor, range.end);
    }

    if (dayEnd - cursor >= requiredDuration) {
      alternatives.push({
        start: minutesToTime(cursor),
        end: minutesToTime(cursor + requiredDuration),
        duration: requiredDuration,
        conflictFree: true,
      });
    }

    return alternatives.slice(0, 5);
  }

  async getScenario(id) {
    const scenario = await simRepo.findScenarioById(id);
    if (!scenario) throw NotFoundError.resource('Simulation scenario');
    return successResponse({ scenario });
  }

  async getResults(id) {
    const scenario = await simRepo.findScenarioById(id);
    if (!scenario) throw NotFoundError.resource('Simulation scenario');

    const result = await simRepo.findResultBySimulationId(id);
    if (!result) {
      return {
        success: true,
        scenarioId: id,
        status: scenario.status,
        message: 'Simulation results not yet available',
      };
    }

    return {
      success: true,
      scenarioId: id,
      status: scenario.status,
      affectedTrains: result.affectedTrains,
      expectedDelay: result.expectedDelay,
      affectedAssets: result.affectedAssets,
      infrastructureAvailability: result.infrastructureAvailability,
      conflicts: result.conflicts,
      blockUtilization: result.blockUtilization,
      risk: result.risk,
      alternativeBlocks: result.alternativeBlocks,
    };
  }

  async _countScenarios() {
    const { query } = require('../config/db');
    const result = await query('SELECT COUNT(*) as count FROM simulation_scenarios');
    return parseInt(result.rows[0].count);
  }

  async _countResults() {
    const { query } = require('../config/db');
    const result = await query('SELECT COUNT(*) as count FROM simulation_results');
    return parseInt(result.rows[0].count);
  }
}

module.exports = { instance: new SimulationService(), setSocketIO };
