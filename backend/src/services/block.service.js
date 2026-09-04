const blockRepo = require('../repositories/block.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const conflictRepo = require('../repositories/conflict.repository');
const conflictService = require('./conflict.service');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, nextSequentialId, timeToMinutes, minutesToTime, timesOverlap, isValidTime } = require('../utils/helpers');

class BlockService {
  async getBlocks(filters) {
    const blocks = await blockRepo.findWithFilters(filters);
    return successResponse({ blocks });
  }

  async getBlockById(id) {
    const block = await blockRepo.findById(id);
    if (!block) throw NotFoundError.resource('Block');
    return successResponse({ block });
  }

  async createBlock(data) {
    const id = await nextSequentialId('BLK', () => blockRepo.count());
    const block = await blockRepo.create({ id, ...data });

    try {
      await conflictService.detectConflictsForDate(block.corridorId, block.date);
    } catch (err) {
      console.error(`Conflict detection failed after creating block ${block.id}:`, err.message);
    }

    return { success: true, message: 'Block request created', block };
  }

  async updateBlock(id, data) {
    const existing = await blockRepo.findById(id);
    if (!existing) throw NotFoundError.resource('Block');

    if (data.status !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected', 'active', 'completed'];
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }
    if (data.start !== undefined && !isValidTime(data.start)) {
      throw new ValidationError('Invalid start time format (use HH:MM)');
    }
    if (data.end !== undefined && !isValidTime(data.end)) {
      throw new ValidationError('Invalid end time format (use HH:MM)');
    }

    const block = await blockRepo.update(id, data);
    return { success: true, block };
  }

  async deleteBlock(id) {
    const block = await blockRepo.delete(id);
    if (!block) throw NotFoundError.resource('Block');
    return { success: true, message: 'Block deleted successfully' };
  }

  // Matches schema key `availableBlocks` (was `availableSlots`).
  async getAvailableSlots({ corridorId, date, duration }) {
    if (!corridorId) throw new ValidationError('corridorId is required');
    if (!date) throw new ValidationError('date is required');
    if (!duration || duration <= 0) throw new ValidationError('duration must be a positive number');

    const existingBlocks = await blockRepo.findByCorridorAndDate(corridorId, date);
    const trainSchedules = await trainScheduleRepo.findWithFilters({ corridorId, date });

    const blockedRanges = [
      ...existingBlocks.map((b) => ({ start: timeToMinutes(b.start), end: timeToMinutes(b.end), reason: `Block: ${b.reason || 'maintenance'}` })),
      ...trainSchedules.map((t) => ({ start: timeToMinutes(t.arrivalTime), end: timeToMinutes(t.departureTime) + 15, reason: `Train ${t.trainNumber}` })),
    ].sort((a, b) => a.start - b.start);

    const dayStart = 0;
    const dayEnd = 1440;
    const slots = [];
    let cursor = dayStart;

    for (const range of blockedRanges) {
      if (range.start - cursor >= duration) {
        slots.push({
          start: minutesToTime(cursor),
          end: minutesToTime(range.start),
          duration: range.start - cursor,
        });
      }
      cursor = Math.max(cursor, range.end);
    }

    if (dayEnd - cursor >= duration) {
      slots.push({
        start: minutesToTime(cursor),
        end: minutesToTime(dayEnd),
        duration: dayEnd - cursor,
      });
    }

    return successResponse({ availableBlocks: slots });
  }

  // Matches schema shape: {id, blockId, departments, reason, severity}.
  async getBlockConflicts(filters = {}) {
    const corridorId = filters.corridorId;
    const date = filters.date;

    const blocks = corridorId && date
      ? await blockRepo.findByCorridorAndDate(corridorId, date)
      : await blockRepo.findWithFilters({ status: 'pending' });

    const conflicts = [];
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[i].date === blocks[j].date && timesOverlap(blocks[i].start, blocks[i].end, blocks[j].start, blocks[j].end)) {
          conflicts.push({
            id: `${blocks[i].id}_${blocks[j].id}`,
            blockId: blocks[i].id,
            departments: [blocks[i].departmentId, blocks[j].departmentId],
            reason: `Overlapping maintenance requests: ${blocks[i].reason || blocks[i].id} vs ${blocks[j].reason || blocks[j].id}`,
            severity: 'high',
          });
        }
      }
    }

    return successResponse({ conflicts });
  }
}

module.exports = new BlockService();