const aiClient = require('../utils/aiClient');
const assetRepo = require('../repositories/asset.repository');
const { successResponse } = require('../utils/helpers');

class PredictionService {
  /**
   * Helper to derive asset age in years from installation date or explicit age parameter
   */
  _deriveAssetAgeYears(params, asset) {
    if (params.assetAgeYears !== undefined && params.assetAgeYears !== null) {
      return Number(params.assetAgeYears);
    }
    if (params.age !== undefined && params.age !== null) {
      return Number(params.age);
    }
    const installDate = asset?.installationDate || params.installationDate || params.installation_date;
    if (installDate) {
      const parsedDate = new Date(installDate);
      if (!isNaN(parsedDate.getTime())) {
        const years = (new Date() - parsedDate) / (365.25 * 24 * 60 * 60 * 1000);
        return Math.max(0, parseFloat(years.toFixed(2)));
      }
    }
    return 0;
  }

  /**
   * Helper to derive expected degradation from condition parameter or asset record
   */
  _deriveExpectedDegradation(params, asset) {
    if (params.expectedDegradation !== undefined && params.expectedDegradation !== null) {
      return Number(params.expectedDegradation);
    }
    const cond = (params.condition || asset?.condition || 'healthy').toLowerCase();
    switch (cond) {
      case 'good':
      case 'healthy':
        return 0.2;
      case 'fair':
        return 0.4;
      case 'warning':
        return 0.7;
      case 'critical':
        return 0.95;
      default:
        return 0.2;
    }
  }

  /**
   * Delegates maintenance priority prediction to FastAPI AI Engine
   */
  async predictMaintenancePriority(params = {}) {
    const assetId = params.assetId;
    let asset = null;
    if (assetId) {
      try {
        asset = await assetRepo.findById(assetId);
      } catch (err) {
        // Log warning but allow request to proceed if parameters are directly supplied
        console.warn(`Asset ${assetId} look up failed:`, err.message);
      }
    }

    const overdueDays = params.overdueDays !== undefined ? params.overdueDays : (params.overdueDuration || 0);
    const defectSeverity = params.defectSeverity !== undefined ? params.defectSeverity : (asset?.defectSeverity ?? 5);
    const assetCriticality = params.assetCriticality !== undefined ? params.assetCriticality : (asset?.criticality ?? 5);
    const assetAgeYears = this._deriveAssetAgeYears(params, asset);
    const expectedDegradation = this._deriveExpectedDegradation(params, asset);

    const payload = {
      assetId: assetId || 'AST-001',
      defectSeverity: Number(defectSeverity),
      assetCriticality: Number(assetCriticality),
      historicalFailures: Number(params.historicalFailures || 0),
      overdueDays: Number(overdueDays),
      trainTraffic: Number(params.trainTraffic || 0),
      safetyRisk: Number(params.safetyRisk !== undefined ? params.safetyRisk : 5),
      expectedDegradation: Number(expectedDegradation),
      assetAgeYears: Number(assetAgeYears),
    };

    const result = await aiClient.post('/api/predictions/maintenance-priority', payload);

    return successResponse({
      assetId: result.assetId || assetId,
      priorityScore: result.priorityScore,
      failureRisk: result.failureRisk,
      riskLevel: result.riskLevel,
      recommendedDeadline: result.recommendedDeadline,
    });
  }

  /**
   * Delegates failure risk prediction to FastAPI AI Engine
   */
  async predictFailureRisk(params = {}) {
    const assetId = params.assetId;
    let asset = null;
    if (assetId) {
      try {
        asset = await assetRepo.findById(assetId);
      } catch (err) {
        console.warn(`Asset ${assetId} look up failed:`, err.message);
      }
    }

    const condition = params.condition || asset?.condition || 'healthy';
    const defectSeverity = params.defectSeverity !== undefined ? params.defectSeverity : (asset?.defectSeverity ?? 0);
    const assetAgeYears = this._deriveAssetAgeYears(params, asset);
    const expectedDegradation = this._deriveExpectedDegradation(params, asset);

    const payload = {
      assetId: assetId || 'AST-001',
      historicalFailures: Number(params.historicalFailures || 0),
      condition,
      assetAgeYears: Number(assetAgeYears),
      defectSeverity: Number(defectSeverity),
      expectedDegradation: Number(expectedDegradation),
    };

    const result = await aiClient.post('/api/predictions/failure-risk', payload);

    return successResponse({
      assetId: result.assetId || assetId,
      failureRisk: result.failureRisk,
      riskLevel: result.riskLevel,
    });
  }

  /**
   * Delegates traffic impact prediction to FastAPI AI Engine
   */
  async predictTrafficImpact(params = {}) {
    const payload = {
      corridorId: params.corridorId || 'COR-001',
      blockStart: params.blockStart || '10:00',
      blockEnd: params.blockEnd || '14:00',
      maintenanceDuration: Number(params.maintenanceDuration || 240),
      planningDate: params.planningDate || params.date || new Date().toISOString().split('T')[0],
    };

    const result = await aiClient.post('/api/predictions/traffic-impact', payload);

    return successResponse({
      expectedImpact: result.expectedImpact || result,
    });
  }
}

module.exports = new PredictionService();