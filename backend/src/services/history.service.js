const maintenanceHistoryRepo = require('../repositories/maintenanceHistory.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const { successResponse } = require('../utils/helpers');

class HistoryService {
  async getHistory(filters) {
    const { assetId } = filters;

    if (assetId) {
      const maintenanceHistory = await maintenanceHistoryRepo.findByAssetId(assetId);
      const failures = await historicalFailureRepo.findByAssetId(assetId);

      const combined = [
        ...maintenanceHistory.map((h) => ({ ...h, category: 'maintenance' })),
        ...failures.map((f) => ({
          ...f,
          category: 'failure',
          description: f.failureType,
          performedAt: f.failureDate,
          type: 'failure',
        })),
      ].sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

      return successResponse({ assetId, history: combined });
    }

    const { query } = require('../config/db');
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
        id: r.id,
        assetId: r.asset_id,
        assetName: r.asset_name,
        description: r.description,
        type: r.type,
        status: r.status,
        performedAt: r.performed_at,
        durationMinutes: r.duration_minutes,
        departmentName: r.department_name,
        category: 'maintenance',
      })),
      ...failuresResult.rows.map((r) => ({
        id: r.id,
        assetId: r.asset_id,
        assetName: r.asset_name,
        description: r.failure_type,
        type: 'failure',
        performedAt: r.failure_date,
        downtimeHours: r.downtime_hours,
        rootCause: r.root_cause,
        category: 'failure',
      })),
    ].sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

    return successResponse({ history });
  }
}

module.exports = new HistoryService();
