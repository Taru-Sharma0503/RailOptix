const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class TrainRepository extends BaseRepository {
  constructor() {
    super('trains', 'id');
  }

  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.corridorId) {
      conditions.push(`corridor_id = $${idx++}`);
      params.push(filters.corridorId);
    }

    let sql = `SELECT id, name, number, type, priority, corridor_id, created_at FROM trains`;
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY priority DESC, number ASC';

    const result = await query(sql, params);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      number: r.number,
      type: r.type,
      priority: r.priority,
      corridorId: r.corridor_id,
    }));
  }

  async findById(id) {
    const result = await query(
      `SELECT t.id, t.name, t.number, t.type, t.priority, t.corridor_id, t.created_at FROM trains t WHERE t.id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return {
      id: r.id,
      name: r.name,
      number: r.number,
      type: r.type,
      priority: r.priority,
      corridorId: r.corridor_id,
    };
  }
}

module.exports = new TrainRepository();
