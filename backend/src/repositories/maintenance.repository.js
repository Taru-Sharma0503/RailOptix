const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class MaintenanceRepository extends BaseRepository {
  constructor() {
    super('maintenance_tasks', 'id');
  }

  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.assetId) {
      conditions.push(`asset_id = $${idx++}`);
      params.push(filters.assetId);
    }
    if (filters.departmentId) {
      conditions.push(`department_id = $${idx++}`);
      params.push(filters.departmentId);
    }
    if (filters.corridorId) {
      conditions.push(`EXISTS (SELECT 1 FROM assets a WHERE a.id = maintenance_tasks.asset_id AND a.corridor_id = $${idx++})`);
      params.push(filters.corridorId);
    }
    // Matches schema's ?priority=critical|high|medium|low filter, bucketed
    // off the computed priority_score since there's no raw "priority" column.
    if (filters.priority) {
      const ranges = {
        critical: 'mt.priority_score > 70',
        high: 'mt.priority_score > 50 AND mt.priority_score <= 70',
        medium: 'mt.priority_score > 30 AND mt.priority_score <= 50',
        low: 'mt.priority_score <= 30',
      };
      if (ranges[filters.priority]) conditions.push(ranges[filters.priority]);
    }

    let sql = `SELECT mt.id, mt.asset_id, mt.department_id, mt.description, mt.severity, mt.estimated_duration, mt.deadline, mt.safety_risk, mt.status, mt.priority_score, mt.failure_risk, mt.external_id, mt.source, mt.created_at, mt.updated_at, a.name as asset_name, a.criticality as asset_criticality, a.condition as asset_condition, a.corridor_id as corridor_id, d.name as department_name
      FROM maintenance_tasks mt
      LEFT JOIN assets a ON mt.asset_id = a.id
      LEFT JOIN departments d ON mt.department_id = d.id`;

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY mt.priority_score DESC, mt.severity DESC, mt.created_at ASC';

    const result = await query(sql, params);
    return result.rows.map((r) => this.mapRow(r));
  }

  async findById(id) {
    const result = await query(
      `SELECT mt.id, mt.asset_id, mt.department_id, mt.description, mt.severity, mt.estimated_duration, mt.deadline, mt.safety_risk, mt.status, mt.priority_score, mt.failure_risk, mt.external_id, mt.source, mt.created_at, mt.updated_at, a.name as asset_name, a.criticality as asset_criticality, a.condition as asset_condition, a.corridor_id as corridor_id, d.name as department_name
       FROM maintenance_tasks mt
       LEFT JOIN assets a ON mt.asset_id = a.id
       LEFT JOIN departments d ON mt.department_id = d.id
       WHERE mt.id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data) {
    const result = await query(
      `INSERT INTO maintenance_tasks (id, asset_id, department_id, description, severity, estimated_duration, deadline, safety_risk, status, priority_score, failure_risk, external_id, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, asset_id, department_id, description, severity, estimated_duration, deadline, safety_risk, status, priority_score, failure_risk, external_id, source, created_at, updated_at`,
      [data.id, data.assetId, data.departmentId || null, data.description, data.severity || 5, data.estimatedDuration || 60, data.deadline || null, data.safetyRisk || 5, data.status || 'pending', data.priorityScore || 0, data.failureRisk || 0, data.externalId || null, data.source || null]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id, data) {
    const fieldMap = {
      description: 'description',
      severity: 'severity',
      estimatedDuration: 'estimated_duration',
      deadline: 'deadline',
      safetyRisk: 'safety_risk',
      status: 'status',
      priorityScore: 'priority_score',
      failureRisk: 'failure_risk',
      departmentId: 'department_id',
      assetId: 'asset_id',
    };

    const setParts = ['updated_at = NOW()'];
    const params = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        setParts.push(`${dbKey} = $${idx++}`);
        params.push(data[jsKey]);
      }
    }

    params.push(id);
    const sql = `UPDATE maintenance_tasks SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING id, asset_id, department_id, description, severity, estimated_duration, deadline, safety_risk, status, priority_score, failure_risk, external_id, source, created_at, updated_at`;
    const result = await query(sql, params);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByExternalId(externalId, source) {
    const result = await query(
      `SELECT * FROM maintenance_tasks WHERE external_id = $1 AND source = $2`,
      [externalId, source]
    );
    return result.rows[0] || null;
  }

  async countByStatus() {
    const result = await query(`SELECT status, COUNT(*) as count FROM maintenance_tasks GROUP BY status`);
    const map = {};
    result.rows.forEach((r) => (map[r.status] = parseInt(r.count)));
    return map;
  }

  async countActive() {
    const result = await query(`SELECT COUNT(*) as count FROM maintenance_tasks WHERE status IN ('pending', 'scheduled', 'in_progress')`);
    return parseInt(result.rows[0].count);
  }

  // Matches schema's `recommendedDeadline` field on the task object. Falls
  // back to a computed suggestion when no explicit deadline is set.
  _computeRecommendedDeadline(priorityScore) {
    const days = priorityScore > 70 ? 1 : priorityScore > 50 ? 3 : priorityScore > 30 ? 7 : 14;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      assetId: r.asset_id,
      departmentId: r.department_id,
      description: r.description,
      severity: r.severity,
      estimatedDuration: r.estimated_duration,
      deadline: r.deadline,
      safetyRisk: r.safety_risk,
      status: r.status,
      priorityScore: r.priority_score,
      failureRisk: r.failure_risk,
      recommendedDeadline: r.deadline || this._computeRecommendedDeadline(r.priority_score),
      externalId: r.external_id,
      source: r.source,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      assetName: r.asset_name,
      assetCriticality: r.asset_criticality,
      assetCondition: r.asset_condition,
      corridorId: r.corridor_id,
      departmentName: r.department_name,
    };
  }
}

module.exports = new MaintenanceRepository();