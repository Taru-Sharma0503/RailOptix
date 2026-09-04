const { query } = require('../config/db');

class MaintenancePlanRepository {
  async create(data) {
    const result = await query(
      `INSERT INTO maintenance_plans (id, optimization_run_id, approved_by, schedule, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.id, data.optimizationRunId, data.approvedBy, JSON.stringify(data.schedule || []), data.status || 'approved']
    );
    return this.mapRow(result.rows[0]);
  }

  async findByOptimizationRunId(runId) {
    const result = await query(`SELECT * FROM maintenance_plans WHERE optimization_run_id = $1 ORDER BY created_at DESC`, [runId]);
    return result.rows.map((r) => this.mapRow(r));
  }

  async findWeekly(startDate, endDate) {
    const result = await query(
      `SELECT mp.id, mp.optimization_run_id, mp.approved_by, mp.schedule, mp.status, mp.created_at,
              u.name as approver_name
       FROM maintenance_plans mp
       LEFT JOIN users u ON mp.approved_by = u.id
       WHERE mp.created_at >= $1 AND mp.created_at <= $2
       ORDER BY mp.created_at DESC`,
      [startDate, endDate + ' 23:59:59']
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  async findMonthly(monthStart, monthEnd) {
    const result = await query(
      `SELECT mp.id, mp.optimization_run_id, mp.approved_by, mp.schedule, mp.status, mp.created_at,
              u.name as approver_name
       FROM maintenance_plans mp
       LEFT JOIN users u ON mp.approved_by = u.id
       WHERE mp.created_at >= $1 AND mp.created_at <= $2
       ORDER BY mp.created_at DESC`,
      [monthStart, monthEnd + ' 23:59:59']
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      optimizationRunId: r.optimization_run_id,
      approvedBy: r.approved_by,
      approverName: r.approver_name,
      schedule: typeof r.schedule === 'string' ? JSON.parse(r.schedule) : r.schedule,
      status: r.status,
      createdAt: r.created_at,
    };
  }
}

module.exports = new MaintenancePlanRepository();
