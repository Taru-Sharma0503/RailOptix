const conflictRepo = require('../repositories/conflict.repository');
const blockRepo = require('../repositories/block.repository');
const departmentRepo = require('../repositories/department.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse, timeToMinutes, minutesToTime, timesOverlap, generateId } = require('../utils/helpers');

class ConflictService {
  async getConflicts(filters) {
    const conflicts = await conflictRepo.findWithFilters(filters);
    return successResponse({ conflicts });
  }

  async getConflictById(id) {
    const conflict = await conflictRepo.findById(id);
    if (!conflict) throw NotFoundError.resource('Conflict');
    return successResponse({ conflict });
  }

  async negotiate({ conflictId }) {
    const conflict = await conflictRepo.findById(conflictId);
    if (!conflict) throw NotFoundError.resource('Conflict');

    await conflictRepo.update(conflictId, { status: 'negotiating' });

    const blockIds = conflict.blockIds || [];
    const blocks = [];
    for (const bid of blockIds) {
      const b = await blockRepo.findById(bid);
      if (b) blocks.push(b);
    }

    if (blocks.length < 2) {
      return successResponse({
        recommendation: {
          type: 'reschedule',
          message: 'Insufficient overlapping blocks detected. Recommend rescheduling one block.',
        },
        departments: conflict.departmentIds,
        reason: 'Only one block found in conflict. Reschedule to a non-overlapping window.',
      });
    }

    const allStarts = blocks.map((b) => timeToMinutes(b.start));
    const allEnds = blocks.map((b) => timeToMinutes(b.end));
    const combinedStart = Math.min(...allStarts);
    const combinedEnd = Math.max(...allEnds);
    const combinedDuration = combinedEnd - combinedStart;

    const trainSchedules = await trainScheduleRepo.findWithFilters({
      corridorId: conflict.corridorId,
      date: conflict.date,
    });

    let bestStart = combinedStart;
    let bestEnd = combinedEnd;
    let bestConflicts = Infinity;

    for (let offset = -60; offset <= 120; offset += 15) {
      const s = combinedStart + offset;
      const e = combinedEnd + offset;
      if (s < 0 || e > 1440) continue;

      let trainConflicts = 0;
      for (const ts of trainSchedules) {
        const tsStart = timeToMinutes(ts.arrivalTime);
        const tsEnd = timeToMinutes(ts.departureTime);
        if (s < tsEnd && tsStart < e) trainConflicts++;
      }

      if (trainConflicts < bestConflicts) {
        bestConflicts = trainConflicts;
        bestStart = s;
        bestEnd = e;
      }
    }

    const departments = [];
    for (const deptId of conflict.departmentIds || []) {
      const dept = await departmentRepo.findById(deptId);
      if (dept) departments.push({ id: dept.id, name: dept.name, code: dept.code });
    }

    return successResponse({
      recommendation: {
        type: 'combined_block',
        start: minutesToTime(bestStart),
        end: minutesToTime(bestEnd),
        duration: bestEnd - bestStart,
        trainConflicts: bestConflicts,
      },
      departments,
      reason: 'Combining maintenance activities reduces total block occupancy and minimizes train disruption.',
    });
  }

  async resolve({ conflictId, resolutionType, start, end }) {
    const conflict = await conflictRepo.findById(conflictId);
    if (!conflict) throw NotFoundError.resource('Conflict');

    const resolution = { resolutionType, start, end, resolvedAt: new Date().toISOString() };

    const updated = await conflictRepo.update(conflictId, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date(),
    });

    if (resolutionType === 'combined_block' && start && end && conflict.blockIds) {
      for (const bid of conflict.blockIds) {
        await blockRepo.update(bid, { status: 'approved', start_time: start, end_time: end });
      }
    }

    return successResponse({
      conflict: updated,
      message: 'Conflict resolved successfully',
    });
  }

  async detectConflictsForDate(corridorId, date) {
    const blocks = await blockRepo.findByCorridorAndDate(corridorId, date);
    const detected = [];

    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (timesOverlap(blocks[i].start, blocks[i].end, blocks[j].start, blocks[j].end)) {
          const existing = detected.find(
            (d) => d.blockIds.includes(blocks[i].id) && d.blockIds.includes(blocks[j].id)
          );
          if (!existing) {
            const count = await conflictRepo.count();
            const conflict = await conflictRepo.create({
              id: generateId('CON', count + detected.length + 1),
              corridorId,
              date,
              type: 'block_overlap',
              severity: 'high',
              blockIds: [blocks[i].id, blocks[j].id],
              departmentIds: [...new Set([blocks[i].departmentId, blocks[j].departmentId])],
              description: `Overlapping blocks: ${blocks[i].id} (${blocks[i].start}-${blocks[i].end}) and ${blocks[j].id} (${blocks[j].start}-${blocks[j].end})`,
            });
            detected.push(conflict);
          }
        }
      }
    }

    return detected;
  }
}

module.exports = new ConflictService();
