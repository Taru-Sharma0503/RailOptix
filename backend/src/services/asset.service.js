const assetRepo = require('../repositories/asset.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const maintenanceHistoryRepo = require('../repositories/maintenanceHistory.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, nextSequentialId, daysBetween } = require('../utils/helpers');
const { query } = require('../config/db');

class AssetService {
  _computeFailureRisk(asset, failureCount) {
    const ageYears = asset.installationDate ? daysBetween(asset.installationDate, new Date()) / 365.25 : 0;
    const conditionScore = asset.condition === 'critical' ? 0.35 : asset.condition === 'warning' ? 0.15 : 0.02;
    const criticalityScore = (asset.criticality / 10) * 0.20;
    const defectScore = (asset.defectSeverity / 10) * 0.20;
    const failureScore = Math.min(failureCount / 10, 1) * 0.15;
    const ageScore = Math.min(ageYears / 30, 1) * 0.10;
    return {
      failureRisk: parseFloat(
        Math.min(conditionScore + criticalityScore + defectScore + failureScore + ageScore, 1).toFixed(2)
      ),
      ageYears,
    };
  }

  // Matches schema: nested `location`, and `failureRisk` on each list item.
  async getAssets(filters) {
    const assets = await assetRepo.findWithFilters(filters);

    const enriched = await Promise.all(
      assets.map(async (a) => {
        const failures = await historicalFailureRepo.findByAssetId(a.id);
        const { failureRisk } = this._computeFailureRisk(a, failures.length);
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          corridorId: a.corridorId,
          condition: a.condition,
          criticality: a.criticality,
          failureRisk,
          location: { latitude: a.latitude, longitude: a.longitude },
        };
      })
    );

    return successResponse({ assets: enriched });
  }

  // Matches schema: `corridor` field, embedded `maintenanceHistory` and
  // `historicalFailures`, plus `failureRisk`.
  async getAssetById(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    const maintenanceHistory = await maintenanceHistoryRepo.findByAssetId(id);
    const historicalFailures = await historicalFailureRepo.findByAssetId(id);
    const { failureRisk } = this._computeFailureRisk(asset, historicalFailures.length);

    return successResponse({
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        condition: asset.condition,
        criticality: asset.criticality,
        failureRisk,
        corridor: asset.corridorId,
        maintenanceHistory,
        historicalFailures,
      },
    });
  }

  async createAsset(data) {
    const id = data.id || (await nextSequentialId('AST', () => assetRepo.count()));

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

    return { success: true, message: 'Asset created successfully', asset };
  }

  async updateAsset(id, data) {
    const existing = await assetRepo.findById(id);
    if (!existing) throw NotFoundError.resource('Asset');

    const asset = await assetRepo.update(id, data);
    return { success: true, message: 'Asset updated successfully', asset };
  }

  async deleteAsset(id) {
    const asset = await assetRepo.delete(id);
    if (!asset) throw NotFoundError.resource('Asset');
    return { success: true, message: 'Asset deleted successfully' };
  }

  // Matches schema shape: {date, type, description, severity}.
  async getAssetHistory(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    const history = await maintenanceHistoryRepo.findByAssetId(id);
    const failures = await historicalFailureRepo.findByAssetId(id);

    const combined = [
      ...history.map((h) => ({
        date: h.performedAt,
        type: h.type,
        description: h.description,
        severity: h.severity ?? null,
      })),
      ...failures.map((f) => ({
        date: f.failureDate,
        type: 'failure',
        description: f.failureType,
        severity: f.severity ?? null,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return successResponse({ assetId: id, history: combined });
  }

  // Matches schema: `factors` as an array of descriptive strings.
  async getAssetRisk(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) throw NotFoundError.resource('Asset');

    const failures = await historicalFailureRepo.findByAssetId(id);
    const failureCount = failures.length;
    const { failureRisk, ageYears } = this._computeFailureRisk(asset, failureCount);
    const riskLevel = failureRisk >= 0.7 ? 'high' : failureRisk >= 0.4 ? 'medium' : 'low';

    const factors = [];
    if (asset.defectSeverity >= 6) factors.push('High defect severity');
    if (asset.criticality >= 7) factors.push('High asset criticality');
    if (failureCount > 0) factors.push('Historical failures');
    if (asset.condition === 'critical') factors.push('Critical asset condition');
    if (ageYears > 20) factors.push('Aging asset');
    if (factors.length === 0) factors.push('No significant risk factors');

    return {
      success: true,
      assetId: id,
      failureRisk,
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