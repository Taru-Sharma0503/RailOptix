const { query } = require('../config/db');

class HistoricalFailureRepository {
  async findByAssetId(assetId) {
    const result = await query(
      `SELECT id, asset_id, failure_type, failure_date, downtime_hours, root_cause, resolution, created_at
       FROM historical_failures WHERE asset_id = $1 ORDER BY failure_date DESC`,
      [assetId]
    );
    return result.rows.map((r) => ({
      id: r.id,
      assetId: r.asset_id,
      failureType: r.failure_type,
      failureDate: r.failure_date,
      downtimeHours: r.downtime_hours,
      rootCause: r.root_cause,
      resolution: r.resolution,
    }));
  }

  async create(data) {
    const result = await query(
      `INSERT INTO historical_failures (id, asset_id, failure_type, failure_date, downtime_hours, root_cause, resolution)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.id, data.assetId, data.failureType, data.failureDate, data.downtimeHours || 0, data.rootCause || null, data.resolution || null]
    );
    return result.rows[0];
  }

  async countByAssetId(assetId) {
    const result = await query(`SELECT COUNT(*) as count FROM historical_failures WHERE asset_id = $1`, [assetId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = new HistoricalFailureRepository();
