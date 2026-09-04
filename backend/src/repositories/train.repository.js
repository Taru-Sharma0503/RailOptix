const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class TrainRepository extends BaseRepository {
  constructor() {
    super('trains', 'id');
  }

  // Matches schema: train objects carry `departure`/`arrival` (pulled from
  // that train's schedule row for the given date, if provided).
  async findWithFilters(filters = {}) {
    const params = [];
    let idx = 1;

    let dateParamIdx = null;
    if (filters.date) {
      params.push(filters.date);
      dateParamIdx = idx++;
    }

    const conditions = [];
    if (filters.corridorId) {
      params.push(filters.corridorId);
      conditions.push(`t.corridor_id = $${idx++}`);
    }

    const sql = `SELECT t.id, t.name, t.number, t.type, t.priority, t.corridor_id, t.created_at,
                 ts.arrival_time, ts.departure_time
                 FROM trains t
                 LEFT JOIN LATERAL (
                   SELECT arrival_time, departure_time
                   FROM train_schedules
                   WHERE train_id = t.id
                   ${dateParamIdx ? `AND schedule_date = $${dateParamIdx}` : ''}
                   ORDER BY arrival_time ASC
                   LIMIT 1
                 ) ts ON true
                 ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
                 ORDER BY t.priority DESC, t.number ASC`;

    const result = await query(sql, params);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      number: r.number,
      type: r.type,
      priority: r.priority,
      corridorId: r.corridor_id,
      departure: r.departure_time || null,
      arrival: r.arrival_time || null,
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