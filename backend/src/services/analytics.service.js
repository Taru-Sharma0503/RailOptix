const { query } = require('../config/db');
const { successResponse } = require('../utils/helpers');

class AnalyticsService {
  async getKpis({ from, to }) {
    const hasRange = Boolean(from && to);
    const taskDateFilter = hasRange ? `WHERE mt.created_at >= $1 AND mt.created_at <= $2` : '';
    const taskParams = hasRange ? [from, to + ' 23:59:59'] : [];

    const totalAssetsResult = await query('SELECT COUNT(*) as count FROM assets');
    const healthyAssetsResult = await query("SELECT COUNT(*) as count FROM assets WHERE condition = 'healthy'");
    const totalAssets = parseInt(totalAssetsResult.rows[0].count);
    const healthyAssets = parseInt(healthyAssetsResult.rows[0].count);
    const infraAvailability = totalAssets > 0 ? parseFloat(((healthyAssets / totalAssets) * 100).toFixed(1)) : 100;

    const completedResult = await query(
      `SELECT COUNT(*) as count FROM maintenance_tasks mt WHERE mt.status = 'completed' ${hasRange ? 'AND mt.created_at >= $1 AND mt.created_at <= $2' : ''}`,
      taskParams
    );
    const totalTasksResult = await query(
      `SELECT COUNT(*) as count FROM maintenance_tasks mt ${taskDateFilter}`,
      taskParams
    );
    const completedTasks = parseInt(completedResult.rows[0].count);
    const totalTasks = parseInt(totalTasksResult.rows[0].count);
    const completionRate = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    const delayResult = hasRange
      ? await query(
          `SELECT COALESCE(AVG(sr.expected_delay), 0) as avg_delay
           FROM simulation_results sr
           JOIN simulation_scenarios ss ON sr.simulation_id = ss.id
           WHERE ss.created_at >= $1 AND ss.created_at <= $2`,
          [from, to + ' 23:59:59']
        )
      : await query('SELECT COALESCE(AVG(expected_delay), 0) as avg_delay FROM simulation_results');
    const avgDelay = parseFloat((parseFloat(delayResult.rows[0].avg_delay) || 0).toFixed(1));

    const blockResult = hasRange
      ? await query(
          `SELECT COALESCE(AVG(duration_minutes), 0) as avg_duration, COUNT(*) as count
           FROM blocks WHERE status IN ('approved','active','completed')
           AND date >= $1 AND date <= $2`,
          [from, to]
        )
      : await query("SELECT COALESCE(AVG(duration_minutes), 0) as avg_duration, COUNT(*) as count FROM blocks WHERE status IN ('approved','active','completed')");
    const blockUtilization = blockResult.rows[0].count > 0
      ? parseFloat(Math.min(100, (parseFloat(blockResult.rows[0].avg_duration) / 240) * 100).toFixed(1))
      : 0;

    const conflictsAvoidedResult = hasRange
      ? await query(
          `SELECT COUNT(*) as count FROM conflicts WHERE status = 'resolved' AND resolved_at >= $1 AND resolved_at <= $2`,
          [from, to + ' 23:59:59']
        )
      : await query("SELECT COUNT(*) as count FROM conflicts WHERE status = 'resolved'");
    const conflictsAvoided = parseInt(conflictsAvoidedResult.rows[0].count);

    const downtimeResult = hasRange
      ? await query(
          `SELECT COALESCE(SUM(duration_minutes), 0) as total FROM maintenance_history WHERE performed_at >= $1 AND performed_at <= $2`,
          [from, to + ' 23:59:59']
        )
      : await query("SELECT COALESCE(SUM(duration_minutes), 0) as total FROM maintenance_history");
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

  // Matches schema: {data: [{date, delayMinutes}]}.
  async getDelays({ from, to }) {
    let sql = `SELECT sr.expected_delay, ss.train_schedule_date
               FROM simulation_results sr
               JOIN simulation_scenarios ss ON sr.simulation_id = ss.id`;
    const params = [];
    if (from && to) {
      sql += ` WHERE ss.train_schedule_date >= $1 AND ss.train_schedule_date <= $2`;
      params.push(from, to);
    }
    sql += ` ORDER BY ss.train_schedule_date DESC`;

    const result = await query(sql, params);

    const data = result.rows.map((r) => ({
      date: r.train_schedule_date,
      delayMinutes: r.expected_delay,
    }));

    return successResponse({ data });
  }

  // Matches schema: {data: [{date, availability}]}. Approximated as a daily
  // trend derived from maintenance/failure event volume vs. total assets,
  // since there is no dedicated daily-availability-snapshot table.
  async getAvailability({ from, to }) {
    const totalAssetsResult = await query('SELECT COUNT(*) as count FROM assets');
    const totalAssets = parseInt(totalAssetsResult.rows[0].count) || 1;

    const hasRange = Boolean(from && to);
    const eventsResult = hasRange
      ? await query(
          `SELECT performed_at::date as day, COUNT(*) as count
           FROM maintenance_history
           WHERE performed_at >= $1 AND performed_at <= $2
           GROUP BY performed_at::date
           ORDER BY performed_at::date ASC`,
          [from, to + ' 23:59:59']
        )
      : await query(
          `SELECT performed_at::date as day, COUNT(*) as count
           FROM maintenance_history
           GROUP BY performed_at::date
           ORDER BY performed_at::date ASC`
        );

    const data = eventsResult.rows.map((r) => ({
      date: r.day.toISOString ? r.day.toISOString().split('T')[0] : r.day,
      availability: parseFloat(Math.max(0, 100 - (parseInt(r.count) / totalAssets) * 100).toFixed(1)),
    }));

    return successResponse({ data });
  }
}

module.exports = new AnalyticsService();