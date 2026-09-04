const conflictRepo = require('../repositories/conflict.repository');
const blockRepo = require('../repositories/block.repository');
const departmentRepo = require('../repositories/department.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, timeToMinutes, minutesToTime, timesOverlap, nextSequentialId } = require('../utils/helpers');

class ConflictService {
  // Matches schema: conflict objects carry `start`/`end` (derived from their
  // blocks) and `departments` as names, not IDs.
  async getConflicts(filters) {
    const conflicts = await conflictRepo.findWithFilters(filters);
    const enriched = await Promise.all(conflicts.map((c) => this._enrichConflict(c)));
    return successResponse({ conflicts: enriched });
  }

  async _enrichConflict(conflict) {
    const blocks = [];
    for (const bid of conflict.blockIds || []) {
      const b = await blockRepo.findById(bid);
      if (b) blocks.push(b);
    }

    let start = null;
    let end = null;
    if (blocks.length > 0) {
      start = blocks.reduce((min, b) => (timeToMinutes(b.start) < timeToMinutes(min) ? b.start : min), blocks[0].start);
      end = blocks.reduce((max, b) => (timeToMinutes(b.end) > timeToMinutes(max) ? b.end : max), blocks[0].end);
    }

    const departments = [];
    for (const deptId of conflict.departmentIds || []) {
      const dept = await departmentRepo.findById(deptId);
      departments.push(dept ? dept.name : deptId);
    }

    return {
      id: conflict.id,
      corridorId: conflict.corridorId,
      start,
      end,
      departments,
      severity: conflict.severity,
    };
  }

  // Matches schema: {id, requests: [{department, duration}], overlap}.
  async getConflictById(id) {
    const conflict = await conflictRepo.findById(id);
    if (!conflict) throw NotFoundError.resource('Conflict');

    const blocks = [];
    for (const bid of conflict.blockIds || []) {
      const b = await blockRepo.findById(bid);
      if (b) blocks.push(b);
    }

    const requests = [];
    for (const b of blocks) {
      const dept = await departmentRepo.findById(b.departmentId);
      requests.push({
        department: dept ? dept.name : b.departmentId,
        duration: b.durationMinutes,
      });
    }

    let overlap = null;
    if (blocks.length >= 2) {
      const starts = blocks.map((b) => timeToMinutes(b.start));
      const ends = blocks.map((b) => timeToMinutes(b.end));
      overlap = Math.max(0, Math.min(...ends) - Math.max(...starts));
    }

    return successResponse({
      conflict: { id: conflict.id, requests, overlap },
    });
  }

  async detectConflicts({ corridorId, date }) {
    if (!corridorId) throw new ValidationError('corridorId is required');
    if (!date) throw new ValidationError('date is required');

    const detected = await this.detectConflictsForDate(corridorId, date);
    return successResponse({ corridorId, date, detected: detected.length, conflicts: detected });
  }

  // Matches schema: `departments` is always [{department, allocatedDuration}]
  // in both the combined-block path and the insufficient-blocks fallback.
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
      const departments = [];
      for (const deptId of conflict.departmentIds || []) {
        const dept = await departmentRepo.findById(deptId);
        departments.push({ department: dept ? dept.name : deptId, allocatedDuration: null });
      }
      return successResponse({
        recommendation: {
          type: 'reschedule',
          message: 'Insufficient overlapping blocks detected. Recommend rescheduling one block.',
        },
        departments,
        reason: 'Only one block found in conflict. Reschedule to a non-overlapping window.',
      });
    }

    const allStarts = blocks.map((b) => timeToMinutes(b.start));
    const allEnds = blocks.map((b) => timeToMinutes(b.end));
    const combinedStart = Math.min(...allStarts);
    const combinedEnd = Math.max(...allEnds);

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
    for (const b of blocks) {
      const dept = await departmentRepo.findById(b.departmentId);
      departments.push({
        department: dept ? dept.name : b.departmentId,
        allocatedDuration: b.durationMinutes,
      });
    }

    return successResponse({
      recommendation: {
        type: 'combined_block',
        start: minutesToTime(bestStart),
        end: minutesToTime(bestEnd),
        duration: bestEnd - bestStart,
      },
      departments,
      reason: 'Combining maintenance activities reduces total block occupancy and minimizes train disruption.',
    });
  }

  // Matches schema: flat {success, message, conflictId, status}.
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
        await blockRepo.update(bid, { status: 'approved', start, end });
      }
    }

    return {
      success: true,
      message: 'Conflict resolved successfully',
      conflictId: updated.id,
      status: updated.status,
    };
  }

  async detectConflictsForDate(corridorId, date) {
    const blocks = await blockRepo.findByCorridorAndDate(corridorId, date);
    const detected = [];
    const existingOpen = await conflictRepo.findWithFilters({ corridorId });

    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (timesOverlap(blocks[i].start, blocks[i].end, blocks[j].start, blocks[j].end)) {
          const alreadyRecorded = existingOpen.find(
            (d) => (d.blockIds || []).includes(blocks[i].id) && (d.blockIds || []).includes(blocks[j].id)
          );
          const existingInBatch = detected.find(
            (d) => d.blockIds.includes(blocks[i].id) && d.blockIds.includes(blocks[j].id)
          );
          if (!alreadyRecorded && !existingInBatch) {
            const id = await nextSequentialId('CON', () => conflictRepo.count());
            const conflict = await conflictRepo.create({
              id,
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