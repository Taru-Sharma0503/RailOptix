const assetRepo = require('../repositories/asset.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const maintenanceHistoryRepo = require('../repositories/maintenanceHistory.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, nextSequentialId, daysBetween } = require('../utils/helpers');
const { query } = require('../config/db');

class AssetService {
  async getAssets(filters) {
    const assets = await assetRepo.findWithFilters(filters);
    return successResponse({ assets });
  }

  async getAssetById(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');
    return successResponse({ asset });
  }

  async createAsset(data) {
    const id = data.id || await nextSequentialId('AST', () => assetRepo.count());

    const asset = await assetRepo.create({
      id,
      name: data.name,
      type: data.type,
      corridorId: data.corridorId,
      criticality: data.criticality,
      condition: data.condition,
      defectSeverity: data.defectSeverity,
      installationDate: data.installationDate,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    return { success: true, asset };
  }

  async updateAsset(id, data) {
    const existing = await assetRepo.findById(id);
    if (!existing) throw NotFoundError.resource('Asset');

    const asset = await assetRepo.update(id, data);
    return { success: true, asset };
  }

  async deleteAsset(id) {
    const asset = await assetRepo.delete(id);
    if (!asset) throw NotFoundError.resource('Asset');
    return { success: true, message: 'Asset deleted successfully' };
  }

  async getAssetHistory(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    const history = await maintenanceHistoryRepo.findByAssetId(id);
    const failures = await historicalFailureRepo.findByAssetId(id);

    const combined = [
      ...history.map((h) => ({ ...h, category: 'maintenance' })),
      ...failures.map((f) => ({ ...f, category: 'failure', description: f.failureType, performedAt: f.failureDate })),
    ].sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

    return successResponse({ assetId: id, history: combined });
  }

  async getAssetRisk(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    const failures = await historicalFailureRepo.findByAssetId(id);
    const failureCount = failures.length;

    let ageYears = 0;
    if (asset.installationDate) {
      ageYears = daysBetween(asset.installationDate, new Date()) / 365.25;
    }

    const conditionScore = asset.condition === 'critical' ? 0.35 : asset.condition === 'warning' ? 0.15 : 0.02;
    const criticalityScore = (asset.criticality / 10) * 0.20;
    const defectScore = (asset.defectSeverity / 10) * 0.20;
    const failureScore = Math.min(failureCount / 10, 1) * 0.15;
    const ageScore = Math.min(ageYears / 30, 1) * 0.10;

    const failureRisk = Math.min(conditionScore + criticalityScore + defectScore + failureScore + ageScore, 1);

    const riskLevel = failureRisk >= 0.7 ? 'high' : failureRisk >= 0.4 ? 'medium' : 'low';

    const factors = [
      { factor: 'Asset Condition', value: asset.condition, weight: 0.35, contribution: parseFloat(conditionScore.toFixed(3)) },
      { factor: 'Criticality', value: asset.criticality, weight: 0.20, contribution: parseFloat(criticalityScore.toFixed(3)) },
      { factor: 'Defect Severity', value: asset.defectSeverity, weight: 0.20, contribution: parseFloat(defectScore.toFixed(3)) },
      { factor: 'Historical Failures', value: failureCount, weight: 0.15, contribution: parseFloat(failureScore.toFixed(3)) },
      { factor: 'Asset Age', value: parseFloat(ageYears.toFixed(1)) + ' years', weight: 0.10, contribution: parseFloat(ageScore.toFixed(3)) },
    ];

    return {
      success: true,
      assetId: id,
      failureRisk: parseFloat(failureRisk.toFixed(2)),
      riskLevel,
      factors,
    };
  }

  async addAssetFailure(id, data) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    if (!data.failureType) throw new ValidationError('failureType is required');
    if (!data.failureDate) throw new ValidationError('failureDate is required');

    const failureId = await nextSequentialId('HF', () => this._countAllFailures());

    const failure = await historicalFailureRepo.create({
      id: failureId,
      assetId: id,
      failureType: data.failureType,
      failureDate: data.failureDate,
      downtimeHours: data.downtimeHours || 0,
      rootCause: data.rootCause || null,
      resolution: data.resolution || null,
    });

    return { success: true, failure };
  }

  async _countAllFailures() {
    const result = await query('SELECT COUNT(*) as count FROM historical_failures');
    return parseInt(result.rows[0].count);
  }
}

module.exports = new AssetService();