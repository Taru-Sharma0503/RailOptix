const planRepo = require('../repositories/maintenancePlan.repository');
const optimizationRunRepo = require('../repositories/optimizationRun.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, generateId, isValidDate } = require('../utils/helpers');

class PlanningService {
  async getWeekly(startDate) {
    if (!startDate || !isValidDate(startDate)) throw new ValidationError('Valid startDate is required (YYYY-MM-DD)');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const plans = await planRepo.findWeekly(startDate, end.toISOString().split('T')[0]);
    return successResponse({ startDate, endDate: end.toISOString().split('T')[0], plans });
  }

  async getMonthly(month) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) throw new ValidationError('Valid month is required (YYYY-MM)');

    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);

    const plans = await planRepo.findMonthly(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
    return successResponse({ month, plans });
  }

  async approvePlan({ optimizationRunId, approvedBy, schedule }) {
    const run = await optimizationRunRepo.findById(optimizationRunId);
    if (!run) throw NotFoundError.resource('Optimization run');
    if (run.status !== 'completed') throw new ValidationError('Cannot approve an incomplete optimization run');

    const { query } = require('../config/db');
    const countResult = await query('SELECT COUNT(*) as count FROM maintenance_plans');
    const id = generateId('MP', parseInt(countResult.rows[0].count) + 1);

    const plan = await planRepo.create({
      id,
      optimizationRunId,
      approvedBy,
      schedule,
      status: 'approved',
    });

    return { success: true, plan, message: 'Plan approved successfully' };
  }
}

module.exports = new PlanningService();
