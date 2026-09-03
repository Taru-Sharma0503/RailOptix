const { query } = require('../config/db');
const { successResponse } = require('../utils/helpers');

class AnalyticsService {
  async getKpis({ from, to }) {
    const dateFilter = from && to
      ? `WHERE mt.created_at >= $1 AND mt.created_at <= $2`
      : '';
    const params = from && to ? [from, to + ' 23:59:59'] : [];

    const totalAssetsResult = await query('SELECT COUNT(*) as count FROM assets');
    const healthyAssetsResult = await query("SELECT COUNT(*) as count FROM assets WHERE condition = 'healthy'");
    const totalAssets = parseInt(totalAssetsResult.rows[0].count);
    const healthyAssets = parseInt(healthyAssetsResult.rows[0].count);
    const infraAvailability = totalAssets > 0 ? parseFloat(((healthyAssets / totalAssets) * 100).toFixed(1)) : 100;

    const completedResult = await query(`SELECT COUNT(*) as count FROM maintenance_tasks WHERE status = 'completed'`);
    const totalTasksResult = await query(`SELECT COUNT(*) as count FROM maintenance_tasks`);
    const completedTasks = parseInt(completedResult.rows[0].count);
    const totalTasks = parseInt(totalTasksResult.rows[0].count);
    const completionRate = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    const delayResult = await query('SELECT COALESCE(AVG(expected_delay), 0) as avg_delay FROM simulation_results');
    const avgDelay = parseFloat((parseFloat(delayResult.rows[0].avg_delay) || 0).toFixed(1));

    const blockResult = await query("SELECT COALESCE(AVG(duration_minutes), 0) as avg_duration, COUNT(*) as count FROM blocks WHERE status IN ('approved','active','completed')");
    const blockUtilization = blockResult.rows[0].count > 0
      ? parseFloat(Math.min(100, (parseFloat(blockResult.rows[0].avg_duration) / 240) * 100).toFixed(1))
      : 0;

    const conflictsAvoidedResult = await query("SELECT COUNT(*) as count FROM conflicts WHERE status = 'resolved'");
    const conflictsAvoided = parseInt(conflictsAvoidedResult.rows[0].count);

    const downtimeResult = await query("SELECT COALESCE(SUM(duration_minutes), 0) as total FROM maintenance_history");
    const maintenanceDowntime = parseInt(downtimeResult.rows[0].total);

    return successResponse({
      kpis: {
        infrastructureAvailability: infraAvailability,
        maintenanceCompletionRate: completionRate,
        averageTrainDelay: avgDelay,
        blockUtilization,
        conflictsAvoided,
        maintenanceDowntime,
      },
    });
  }

  async getDelays({ from, to }) {
    let sql = `SELECT sr.expected_delay, ss.corridor_id, ss.train_schedule_date, ss.id as simulation_id
               FROM simulation_results sr
               JOIN simulation_scenarios ss ON sr.simulation_id = ss.id`;
    const params = [];
    if (from && to) {
      sql += ` WHERE ss.train_schedule_date >= $1 AND ss.train_schedule_date <= $2`;
      params.push(from, to);
    }
    sql += ` ORDER BY ss.train_schedule_date DESC`;

    const result = await query(sql, params);

    const delays = result.rows.map((r) => ({
      simulationId: r.simulation_id,
      corridorId: r.corridor_id,
      date: r.train_schedule_date,
      expectedDelay: r.expected_delay,
    }));

    const avgDelay = delays.length > 0
      ? parseFloat((delays.reduce((s, d) => s + d.expectedDelay, 0) / delays.length).toFixed(1))
      : 0;

    return successResponse({ delays, averageDelay: avgDelay });
  }

  async getAvailability({ from, to }) {
    let sql = `SELECT a.corridor_id, c.name as corridor_name,
               COUNT(*) as total,
               COUNT(CASE WHEN a.condition = 'healthy' THEN 1 END) as healthy,
               COUNT(CASE WHEN a.condition = 'warning' THEN 1 END) as warning,
               COUNT(CASE WHEN a.condition = 'critical' THEN 1 END) as critical
               FROM assets a
               LEFT JOIN corridors c ON a.corridor_id = c.id
               GROUP BY a.corridor_id, c.name
               ORDER BY a.corridor_id`;

    const result = await query(sql);

    const availability = result.rows.map((r) => ({
      corridorId: r.corridor_id,
      corridorName: r.corridor_name,
      total: parseInt(r.total),
      healthy: parseInt(r.healthy),
      warning: parseInt(r.warning),
      critical: parseInt(r.critical),
      availability: parseInt(r.total) > 0 ? parseFloat(((parseInt(r.healthy) / parseInt(r.total)) * 100).toFixed(1)) : 100,
    }));

    return successResponse({ availability });
  }
}

module.exports = new AnalyticsService();
