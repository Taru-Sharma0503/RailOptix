const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class ConflictRepository extends BaseRepository {
  constructor() {
    super('conflicts', 'id');
  }

  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.corridorId) {
      conditions.push(`corridor_id = $${idx++}`);
      params.push(filters.corridorId);
    }
    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      params.push(filters.status);
    }

    let sql = `SELECT c.id, c.corridor_id, c.date, c.type, c.severity, c.status, c.block_ids, c.department_ids, c.description, c.resolution, c.created_at, c.resolved_at,
               cor.name as corridor_name
               FROM conflicts c
               LEFT JOIN corridors cor ON c.corridor_id = cor.id`;

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY c.created_at DESC';

    const result = await query(sql, params);
    return result.rows.map((r) => this.mapRow(r));
  }

  async findById(id) {
    const result = await query(
      `SELECT c.id, c.corridor_id, c.date, c.type, c.severity, c.status, c.block_ids, c.department_ids, c.description, c.resolution, c.created_at, c.resolved_at,
              cor.name as corridor_name
       FROM conflicts c
       LEFT JOIN corridors cor ON c.corridor_id = cor.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data) {
    const result = await query(
      `INSERT INTO conflicts (id, corridor_id, date, type, severity, status, block_ids, department_ids, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.id, data.corridorId, data.date, data.type || 'block_overlap', data.severity || 'medium', data.status || 'open', data.blockIds || [], data.departmentIds || [], data.description || null]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id, data) {
    const fieldMap = {
      status: 'status',
      severity: 'severity',
      resolution: 'resolution',
      resolvedAt: 'resolved_at',
    };

    const setParts = [];
    const params = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        setParts.push(`${dbKey} = $${idx++}`);
        params.push(data[jsKey]);
      }
    }

    if (setParts.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE conflicts SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, params);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async countActive() {
    const result = await query(`SELECT COUNT(*) as count FROM conflicts WHERE status = 'open'`);
    return parseInt(result.rows[0].count);
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      corridorId: r.corridor_id,
      corridorName: r.corridor_name,
      date: r.date,
      type: r.type,
      severity: r.severity,
      status: r.status,
      blockIds: r.block_ids,
      departmentIds: r.department_ids,
      description: r.description,
      resolution: r.resolution,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
    };
  }
}

module.exports = new ConflictRepository();
