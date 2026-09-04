const planRepo = require('../repositories/maintenancePlan.repository');
const optimizationRunRepo = require('../repositories/optimizationRun.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, nextSequentialId, isValidDate } = require('../utils/helpers');
const { query } = require('../config/db');

class PlanningService {
  // Matches schema: {week, schedule: [{date, tasks, blocks}]}.
  async getWeekly(startDate) {
    if (!startDate || !isValidDate(startDate)) throw new ValidationError('Valid startDate is required (YYYY-MM-DD)');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const schedule = await this._buildDailySchedule(startDate, end.toISOString().split('T')[0]);
    return successResponse({ week: startDate, schedule });
  }

  // Matches schema: {month, schedule: [{date, tasks, blocks}]}.
  async getMonthly(month) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) throw new ValidationError('Valid month is required (YYYY-MM)');

    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);

    const schedule = await this._buildDailySchedule(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
    return successResponse({ month, schedule });
  }

  async _buildDailySchedule(startDate, endDate) {
    const blocksResult = await query(
      `SELECT id, corridor_id, department_id, date, start_time, end_time, reason, status, maintenance_task_ids
       FROM blocks WHERE date >= $1 AND date <= $2 ORDER BY date ASC, start_time ASC`,
      [startDate, endDate]
    );

    const byDate = {};
    for (const row of blocksResult.rows) {
      const dateKey = row.date.toISOString ? row.date.toISOString().split('T')[0] : row.date;
      if (!byDate[dateKey]) byDate[dateKey] = { tasks: new Set(), blocks: [] };
      byDate[dateKey].blocks.push({
        id: row.id,
        corridorId: row.corridor_id,
        departmentId: row.department_id,
        start: row.start_time,
        end: row.end_time,
        reason: row.reason,
        status: row.status,
      });
      for (const taskId of row.maintenance_task_ids || []) {
        byDate[dateKey].tasks.add(taskId);
      }
    }

    return Object.keys(byDate)
      .sort()
      .map((date) => ({
        date,
        tasks: Array.from(byDate[date].tasks),
        blocks: byDate[date].blocks,
      }));
  }

  // Matches schema: generated ID prefix "PLAN-xxx" and a top-level `status`.
  async approvePlan({ optimizationRunId, approvedBy, schedule }) {
    const run = await optimizationRunRepo.findById(optimizationRunId);
    if (!run) throw NotFoundError.resource('Optimization run');
    if (run.status !== 'completed') throw new ValidationError('Cannot approve an incomplete optimization run');

    const id = await nextSequentialId('PLAN', () => this._countPlans());

    const plan = await planRepo.create({
      id,
      optimizationRunId,
      approvedBy,
      schedule,
      status: 'approved',
    });

    return {
      success: true,
      message: 'Maintenance plan approved',
      planId: plan.id,
      status: plan.status,
      plan,
    };
  }

  async _countPlans() {
    const countResult = await query('SELECT COUNT(*) as count FROM maintenance_plans');
    return parseInt(countResult.rows[0].count);
  }
}

module.exports = new PlanningService();