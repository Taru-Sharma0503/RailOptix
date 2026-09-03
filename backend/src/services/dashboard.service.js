const { query } = require('../config/db');
const assetRepo = require('../repositories/asset.repository');
const maintenanceRepo = require('../repositories/maintenance.repository');
const blockRepo = require('../repositories/block.repository');
const conflictRepo = require('../repositories/conflict.repository');
const { timeToMinutes, daysBetween } = require('../utils/helpers');

class DashboardService {
  async getOverview(corridorId) {
    const assetCondition = corridorId
      ? await query(`SELECT condition, COUNT(*) as count FROM assets WHERE corridor_id = $1 GROUP BY condition`, [corridorId])
      : await query(`SELECT condition, COUNT(*) as count FROM assets GROUP BY condition`);

    const conditionMap = {};
    assetCondition.rows.forEach((r) => (conditionMap[r.condition] = parseInt(r.count)));

    const totalAssets = Object.values(conditionMap).reduce((a, b) => a + b, 0);
    const criticalAssets = (conditionMap.critical || 0);

    let activeTasks, activeBlocks, activeConflicts;

    if (corridorId) {
      activeTasks = await query(
        `SELECT COUNT(*) as count FROM maintenance_tasks mt
         JOIN assets a ON mt.asset_id = a.id
         WHERE mt.status IN ('pending','scheduled','in_progress') AND a.corridor_id = $1`,
        [corridorId]
      );
      activeBlocks = await query(`SELECT COUNT(*) as count FROM blocks WHERE corridor_id = $1 AND status IN ('pending','approved','active')`, [corridorId]);
      activeConflicts = await query(`SELECT COUNT(*) as count FROM conflicts WHERE corridor_id = $1 AND status = 'open'`, [corridorId]);
    } else {
      activeTasks = await query(`SELECT COUNT(*) as count FROM maintenance_tasks WHERE status IN ('pending','scheduled','in_progress')`);
      activeBlocks = await query(`SELECT COUNT(*) as count FROM blocks WHERE status IN ('pending','approved','active')`);
      activeConflicts = await query(`SELECT COUNT(*) as count FROM conflicts WHERE status = 'open'`);
    }

    const tasksCompleted = corridorId
      ? await query(`SELECT COUNT(*) as count FROM maintenance_tasks mt JOIN assets a ON mt.asset_id = a.id WHERE mt.status = 'completed' AND a.corridor_id = $1`, [corridorId])
      : await query(`SELECT COUNT(*) as count FROM maintenance_tasks WHERE status = 'completed'`);

    const tasksTotal = parseInt(activeTasks.rows[0].count) + parseInt(tasksCompleted.rows[0].count);
    const completionRate = tasksTotal > 0 ? parseFloat(((parseInt(tasksCompleted.rows[0].count) / tasksTotal) * 100).toFixed(1)) : 0;

    const healthyAssets = conditionMap.healthy || 0;
    const infraAvailability = totalAssets > 0 ? parseFloat(((healthyAssets / totalAssets) * 100).toFixed(1)) : 100;

    const blocksResult = corridorId
      ? await query(`SELECT duration_minutes FROM blocks WHERE corridor_id = $1 AND status IN ('approved','active','completed')`, [corridorId])
      : await query(`SELECT duration_minutes FROM blocks WHERE status IN ('approved','active','completed')`);

    const totalBlockTime = blocksResult.rows.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
    const blockUtilization = totalBlockTime > 0 ? parseFloat(Math.min(100, (totalBlockTime / (1440 * Math.max(1, blocksResult.rows.length))) * 100).toFixed(1)) : 0;

    const delaysResult = corridorId
      ? await query(`SELECT COALESCE(AVG(expected_delay), 0) as avg_delay FROM simulation_results sr JOIN simulation_scenarios ss ON sr.simulation_id = ss.id WHERE ss.corridor_id = $1`, [corridorId])
      : await query(`SELECT COALESCE(AVG(expected_delay), 0) as avg_delay FROM simulation_results`);
    const expectedTrainDelay = parseFloat((parseFloat(delaysResult.rows[0].avg_delay) || 0).toFixed(1));

    const criticalMaintenance = corridorId
      ? await query(
          `SELECT mt.id, mt.description, mt.severity, mt.priority_score, mt.deadline, mt.status, a.name as asset_name, d.name as department_name
           FROM maintenance_tasks mt
           LEFT JOIN assets a ON mt.asset_id = a.id
           LEFT JOIN departments d ON mt.department_id = d.id
           WHERE mt.status IN ('pending','scheduled') AND a.corridor_id = $1
           ORDER BY mt.priority_score DESC, mt.severity DESC LIMIT 5`,
          [corridorId]
        )
      : await query(
          `SELECT mt.id, mt.description, mt.severity, mt.priority_score, mt.deadline, mt.status, a.name as asset_name, d.name as department_name
           FROM maintenance_tasks mt
           LEFT JOIN assets a ON mt.asset_id = a.id
           LEFT JOIN departments d ON mt.department_id = d.id
           WHERE mt.status IN ('pending','scheduled')
           ORDER BY mt.priority_score DESC, mt.severity DESC LIMIT 5`
        );

    const upcomingBlocks = await blockRepo.findUpcoming(5);

    return {
      success: true,
      summary: {
        totalAssets,
        criticalAssets,
        activeMaintenanceTasks: parseInt(activeTasks.rows[0].count),
        activeBlocks: parseInt(activeBlocks.rows[0].count),
        activeConflicts: parseInt(activeConflicts.rows[0].count),
      },
      kpis: {
        infrastructureAvailability: infraAvailability,
        maintenanceCompletionRate: completionRate,
        blockUtilization,
        expectedTrainDelay,
      },
      criticalMaintenance: criticalMaintenance.rows.map((r) => ({
        id: r.id,
        description: r.description,
        severity: r.severity,
        priorityScore: r.priority_score,
        deadline: r.deadline,
        status: r.status,
        assetName: r.asset_name,
        departmentName: r.department_name,
      })),
      upcomingBlocks: upcomingBlocks.map((b) => ({
        id: b.id,
        corridorId: b.corridorId,
        corridorName: b.corridorName,
        departmentName: b.departmentName,
        date: b.date,
        start: b.start,
        end: b.end,
        reason: b.reason,
        status: b.status,
      })),
    };
  }
}

module.exports = new DashboardService();
