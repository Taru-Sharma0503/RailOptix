const blockRepo = require('../repositories/block.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const conflictRepo = require('../repositories/conflict.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, generateId, timeToMinutes, minutesToTime, timesOverlap, isValidTime } = require('../utils/helpers');

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
    const count = await blockRepo.count();
    const id = generateId('BLK', count + 1);
    const block = await blockRepo.create({ id, ...data });
    return { success: true, block };
  }

  async updateBlock(id, data) {
    const existing = await blockRepo.findById(id);
    if (!existing) throw NotFoundError.resource('Block');
    const { update } = require('../config/db');
    const block = await blockRepo.update(id, data);
    return { success: true, block };
  }

  async deleteBlock(id) {
    const block = await blockRepo.delete(id);
    if (!block) throw NotFoundError.resource('Block');
    return { success: true, message: 'Block deleted successfully' };
  }

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

    return successResponse({ corridorId, date, requestedDuration: duration, availableSlots: slots });
  }

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
            blockA: blocks[i],
            blockB: blocks[j],
            overlapStart: blocks[i].start > blocks[j].start ? blocks[i].start : blocks[j].start,
            overlapEnd: blocks[i].end < blocks[j].end ? blocks[i].end : blocks[j].end,
          });
        }
      }
    }

    return successResponse({ conflicts });
  }
}

module.exports = new BlockService();
