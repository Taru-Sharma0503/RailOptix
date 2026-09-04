const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class OptimizationRunRepository extends BaseRepository {
  constructor() {
    super('optimization_runs', 'id');
  }

  async findById(id) {
    const result = await query(
      `SELECT * FROM optimization_runs WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data) {
    const result = await query(
      `INSERT INTO optimization_runs (id, corridor_id, planning_date, status, progress, message, objective, task_ids, block_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.id, data.corridorId, data.planningDate, data.status || 'queued', 0, data.message || 'Queued', JSON.stringify(data.objective) || null, data.taskIds || [], data.blockIds || []]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id, data) {
    const fieldMap = {
      status: 'status',
      progress: 'progress',
      message: 'message',
      result: 'result',
      completedAt: 'completed_at',
    };

    const setParts = [];
    const params = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        if (typeof data[jsKey] === 'object' && data[jsKey] !== null) {
          setParts.push(`${dbKey} = $${idx++}::jsonb`);
          params.push(JSON.stringify(data[jsKey]));
        } else {
          setParts.push(`${dbKey} = $${idx++}`);
          params.push(data[jsKey]);
        }
      }
    }

    if (setParts.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE optimization_runs SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, params);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      corridorId: r.corridor_id,
      planningDate: r.planning_date,
      status: r.status,
      progress: r.progress,
      message: r.message,
      objective: typeof r.objective === 'string' ? JSON.parse(r.objective) : r.objective,
      taskIds: r.task_ids,
      blockIds: r.block_ids,
      result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    };
  }
}

module.exports = new OptimizationRunRepository();
