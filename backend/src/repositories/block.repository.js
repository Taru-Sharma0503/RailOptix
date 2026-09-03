const BaseRepository = require('./base.repository');
const { query } = require('../config/db');
const { timeToMinutes } = require('../utils/helpers');

class BlockRepository extends BaseRepository {
  constructor() {
    super('blocks', 'id');
  }

  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.corridorId) {
      conditions.push(`corridor_id = $${idx++}`);
      params.push(filters.corridorId);
    }
    if (filters.departmentId) {
      conditions.push(`department_id = $${idx++}`);
      params.push(filters.departmentId);
    }
    if (filters.date) {
      conditions.push(`date = $${idx++}`);
      params.push(filters.date);
    }
    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      params.push(filters.status);
    }

    let sql = `SELECT b.id, b.corridor_id, b.department_id, b.date, b.start_time, b.end_time, b.reason, b.status, b.maintenance_task_ids, b.duration_minutes, b.created_at, d.name as department_name, c.name as corridor_name
               FROM blocks b
               LEFT JOIN departments d ON b.department_id = d.id
               LEFT JOIN corridors c ON b.corridor_id = c.id`;

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY b.date ASC, b.start_time ASC';

    const result = await query(sql, params);
    return result.rows.map((r) => this.mapRow(r));
  }

  async findById(id) {
    const result = await query(
      `SELECT b.id, b.corridor_id, b.department_id, b.date, b.start_time, b.end_time, b.reason, b.status, b.maintenance_task_ids, b.duration_minutes, b.created_at, d.name as department_name, c.name as corridor_name
       FROM blocks b
       LEFT JOIN departments d ON b.department_id = d.id
       LEFT JOIN corridors c ON b.corridor_id = c.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data) {
    const { minutesToTime } = require('../utils/helpers');
    const startTime = data.start;
    const endTime = data.end;
    const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

    const result = await query(
      `INSERT INTO blocks (id, corridor_id, department_id, date, start_time, end_time, reason, status, maintenance_task_ids, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, corridor_id, department_id, date, start_time, end_time, reason, status, maintenance_task_ids, duration_minutes, created_at`,
      [data.id, data.corridorId, data.departmentId, data.date, startTime, endTime, data.reason || null, data.status || 'pending', data.maintenanceTaskIds || [], duration]
    );
    return this.mapRow(result.rows[0]);
  }

  async countActive() {
    const result = await query(`SELECT COUNT(*) as count FROM blocks WHERE status IN ('pending', 'approved', 'active')`);
    return parseInt(result.rows[0].count);
  }

  async findUpcoming(limit = 5) {
    const result = await query(
      `SELECT b.id, b.corridor_id, b.department_id, b.date, b.start_time, b.end_time, b.reason, b.status, b.maintenance_task_ids, b.duration_minutes, d.name as department_name, c.name as corridor_name
       FROM blocks b
       LEFT JOIN departments d ON b.department_id = d.id
       LEFT JOIN corridors c ON b.corridor_id = c.id
       WHERE b.date >= CURRENT_DATE AND b.status IN ('pending', 'approved')
       ORDER BY b.date ASC, b.start_time ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  async findByCorridorAndDate(corridorId, date) {
    const result = await query(
      `SELECT * FROM blocks WHERE corridor_id = $1 AND date = $2 ORDER BY start_time ASC`,
      [corridorId, date]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      corridorId: r.corridor_id,
      departmentId: r.department_id,
      date: r.date,
      start: r.start_time,
      end: r.end_time,
      reason: r.reason,
      status: r.status,
      maintenanceTaskIds: r.maintenance_task_ids,
      durationMinutes: r.duration_minutes,
      departmentName: r.department_name,
      corridorName: r.corridor_name,
      createdAt: r.created_at,
    };
  }
}

module.exports = new BlockRepository();
