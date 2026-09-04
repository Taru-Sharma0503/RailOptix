const BaseRepository = require('./base.repository');
const { query } = require('../config/db');

class AssetRepository extends BaseRepository {
  constructor() {
    super('assets', 'id');
  }

  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (filters.type) {
      conditions.push(`type = $${paramIdx++}`);
      params.push(filters.type);
    }
    if (filters.risk) {
      conditions.push(`condition = $${paramIdx++}`);
      params.push(filters.risk === 'high' ? 'critical' : filters.risk === 'medium' ? 'warning' : 'healthy');
    }
    if (filters.corridorId) {
      conditions.push(`corridor_id = $${paramIdx++}`);
      params.push(filters.corridorId);
    }

    let sql = `SELECT id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, created_at FROM assets`;
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY criticality DESC, created_at ASC';

    const result = await query(sql, params);
    return result.rows.map((r) => this.mapRow(r));
  }

  async findById(id) {
    const result = await query(
      `SELECT id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, created_at FROM assets WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data) {
    const result = await query(
      `INSERT INTO assets (id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_SetSRID(ST_MakePoint($10, $9), 4326)::geography)
       RETURNING id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, created_at`,
      [data.id, data.name, data.type, data.corridorId || null, data.criticality || 5, data.condition || 'healthy', data.defectSeverity || 0, data.installationDate || null, data.latitude || null, data.longitude || null]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id, data) {
    const setParts = [];
    const params = [];
    let idx = 1;

    const fieldMap = {
      name: 'name',
      type: 'type',
      corridorId: 'corridor_id',
      criticality: 'criticality',
      condition: 'condition',
      defectSeverity: 'defect_severity',
      installationDate: 'installation_date',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        setParts.push(`${dbKey} = $${idx++}`);
        params.push(data[jsKey]);
      }
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      setParts.push(`latitude = $${idx++}`);
      params.push(data.latitude);
      setParts.push(`longitude = $${idx++}`);
      params.push(data.longitude);
      setParts.push(`location = ST_SetSRID(ST_MakePoint($${idx - 1}, $${idx - 2}), 4326)::geography`);
    }

    if (setParts.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE assets SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, created_at`;
    const result = await query(sql, params);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async countByCondition() {
    const result = await query(`SELECT condition, COUNT(*) as count FROM assets GROUP BY condition`);
    const map = {};
    result.rows.forEach((r) => (map[r.condition] = parseInt(r.count)));
    return map;
  }

  async countCritical() {
    const result = await query(`SELECT COUNT(*) as count FROM assets WHERE condition = 'critical' OR criticality >= 8`);
    return parseInt(result.rows[0].count);
  }

  mapRow(r) {
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      corridorId: r.corridor_id,
      criticality: r.criticality,
      condition: r.condition,
      defectSeverity: r.defect_severity,
      installationDate: r.installation_date,
      latitude: r.latitude,
      longitude: r.longitude,
      createdAt: r.created_at,
    };
  }
}

module.exports = new AssetRepository();
