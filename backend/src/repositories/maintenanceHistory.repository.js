const { query } = require('../config/db');

class MaintenanceHistoryRepository {
  async findByAssetId(assetId) {
    const result = await query(
      `SELECT mh.id, mh.asset_id, mh.task_id, mh.department_id, mh.description, mh.type, mh.status, mh.performed_at, mh.duration_minutes, mh.cost, mh.notes, mh.created_at, d.name as department_name
       FROM maintenance_history mh
       LEFT JOIN departments d ON mh.department_id = d.id
       WHERE mh.asset_id = $1
       ORDER BY mh.performed_at DESC`,
      [assetId]
    );
    return result.rows.map((r) => ({
      id: r.id,
      assetId: r.asset_id,
      taskId: r.task_id,
      departmentId: r.department_id,
      description: r.description,
      type: r.type,
      status: r.status,
      performedAt: r.performed_at,
      durationMinutes: r.duration_minutes,
      cost: r.cost,
      notes: r.notes,
      departmentName: r.department_name,
    }));
  }

  async create(data) {
    const result = await query(
      `INSERT INTO maintenance_history (id, asset_id, task_id, department_id, description, type, status, performed_at, duration_minutes, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [data.id, data.assetId, data.taskId || null, data.departmentId || null, data.description, data.type, data.status || 'completed', data.performedAt, data.durationMinutes || null, data.cost || null, data.notes || null]
    );
    return result.rows[0];
  }
}

module.exports = new MaintenanceHistoryRepository();
