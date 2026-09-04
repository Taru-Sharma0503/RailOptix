const maintenanceHistoryRepo = require('../repositories/maintenanceHistory.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const { successResponse } = require('../utils/helpers');
const { query } = require('../config/db');

class HistoryService {
  // Matches schema shape: {date, event, description, downtimeMinutes}.
  async getHistory(filters) {
    const { assetId } = filters;

    if (assetId) {
      const maintenanceHistory = await maintenanceHistoryRepo.findByAssetId(assetId);
      const failures = await historicalFailureRepo.findByAssetId(assetId);

      const combined = [
        ...maintenanceHistory.map((h) => ({
          date: h.performedAt,
          event: h.type,
          description: h.description,
          downtimeMinutes: h.durationMinutes || 0,
        })),
        ...failures.map((f) => ({
          date: f.failureDate,
          event: 'failure',
          description: f.failureType,
          downtimeMinutes: (f.downtimeHours || 0) * 60,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return successResponse({ assetId, history: combined });
    }

    const result = await query(
      `SELECT mh.id, mh.asset_id, mh.description, mh.type, mh.status, mh.performed_at, mh.duration_minutes,
       a.name as asset_name, d.name as department_name
       FROM maintenance_history mh
       LEFT JOIN assets a ON mh.asset_id = a.id
       LEFT JOIN departments d ON mh.department_id = d.id
       ORDER BY mh.performed_at DESC LIMIT 100`
    );

    const failuresResult = await query(
      `SELECT hf.id, hf.asset_id, hf.failure_type, hf.failure_date, hf.downtime_hours, hf.root_cause,
       a.name as asset_name
       FROM historical_failures hf
       LEFT JOIN assets a ON hf.asset_id = a.id
       ORDER BY hf.failure_date DESC LIMIT 100`
    );

    const history = [
      ...result.rows.map((r) => ({
        date: r.performed_at,
        event: r.type,
        description: r.description,
        downtimeMinutes: r.duration_minutes || 0,
      })),
      ...failuresResult.rows.map((r) => ({
        date: r.failure_date,
        event: 'failure',
        description: r.failure_type,
        downtimeMinutes: (r.downtime_hours || 0) * 60,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return successResponse({ history });
  }
}

module.exports = new HistoryService();