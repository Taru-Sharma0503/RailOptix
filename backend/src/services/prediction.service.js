const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const { successResponse, timeToMinutes, timesOverlap, clamp } = require('../utils/helpers');

class PredictionService {
  // Matches schema: single-asset raw feature payload in, flat priority result out.
  async predictMaintenancePriority({
    assetId,
    defectSeverity = 5,
    assetCriticality = 5,
    historicalFailures = 0,
    overdueDuration = 0,
    trainTraffic = 0,
    safetyRisk = 5,
    expectedDegradation = 0,
  }) {
    const conditionScore = clamp((defectSeverity / 10) * 0.35, 0, 0.35);
    const criticalityScore = (assetCriticality / 10) * 0.20;
    const failureScore = Math.min(historicalFailures / 10, 1) * 0.15;
    const overdueRiskScore = Math.min(overdueDuration / 30, 1) * 0.10;
    const degradationScore = clamp(expectedDegradation, 0, 1) * 0.20;

    const failureRisk = clamp(
      conditionScore + criticalityScore + failureScore + overdueRiskScore + degradationScore,
      0,
      1
    );
    const riskLevel = failureRisk >= 0.7 ? 'high' : failureRisk >= 0.4 ? 'medium' : 'low';

    const severityScore = (defectSeverity / 10) * 30;
    const criticalityWeighted = (assetCriticality / 10) * 20;
    const riskWeighted = failureRisk * 20;
    const safetyScore = (safetyRisk / 10) * 15;
    const trafficScore = Math.min(trainTraffic / 100, 1) * 10;

    let overdueScore = 0;
    if (overdueDuration > 7) overdueScore = 15;
    else if (overdueDuration > 3) overdueScore = 10;
    else if (overdueDuration > 0) overdueScore = 5;

    const priorityScore = parseFloat(
      (severityScore + criticalityWeighted + riskWeighted + safetyScore + trafficScore + overdueScore).toFixed(2)
    );

    const urgencyDays = priorityScore > 70 ? 1 : priorityScore > 50 ? 3 : priorityScore > 30 ? 7 : 14;
    const recommendedDeadline = new Date(Date.now() + urgencyDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return successResponse({
      assetId,
      priorityScore,
      failureRisk: parseFloat(failureRisk.toFixed(2)),
      riskLevel,
      recommendedDeadline,
    });
  }

  // Matches schema: single-asset raw feature payload in, flat risk result out.
  async predictFailureRisk({
    assetId,
    historicalFailures = 0,
    condition = 'healthy',
    age = 0,
    defectSeverity = 0,
  }) {
    const conditionScore = condition === 'critical' ? 0.35 : condition === 'warning' ? 0.15 : 0.02;
    const defectScore = (defectSeverity / 10) * 0.20;
    const failureScore = Math.min(historicalFailures / 10, 1) * 0.15;
    const ageScore = Math.min(age / 30, 1) * 0.10;

    const failureRisk = clamp(conditionScore + defectScore + failureScore + ageScore, 0, 1);
    const riskLevel = failureRisk >= 0.7 ? 'high' : failureRisk >= 0.4 ? 'medium' : 'low';

    return successResponse({
      assetId,
      failureRisk: parseFloat(failureRisk.toFixed(2)),
      riskLevel,
    });
  }

  // Matches schema: nested `expectedImpact` object with counts, not arrays.
  // `date` is optional and not in the documented request; if omitted we fall
  // back to matching schedules across all dates for the corridor.
  async predictTrafficImpact({ corridorId, blockStart, blockEnd, trainType, maintenanceDuration, date }) {
    const trainSchedules = await trainScheduleRepo.findWithFilters({ corridorId, date });

    const relevantSchedules =
      trainType && trainType !== 'all'
        ? trainSchedules.filter((ts) => ts.trainType === trainType)
        : trainSchedules;

    const affectedTrains = [];
    let totalDelay = 0;

    for (const ts of relevantSchedules) {
      if (blockStart && blockEnd && timesOverlap(blockStart, blockEnd, ts.arrivalTime, ts.departureTime)) {
        const overlapStart = Math.max(timeToMinutes(blockStart), timeToMinutes(ts.arrivalTime));
        const overlapEnd = Math.min(timeToMinutes(blockEnd), timeToMinutes(ts.departureTime));
        const delay = Math.min(overlapEnd - overlapStart, 45);
        affectedTrains.push({ ...ts, expectedDelay: delay });
        totalDelay += delay;
      }
    }

    const criticalTrainsAffected = affectedTrains.filter((t) => t.trainPriority >= 7).length;
    const alternativeRoutesAvailable = relevantSchedules.length > 5 ? 2 : relevantSchedules.length > 0 ? 1 : 0;

    return successResponse({
      expectedImpact: {
        affectedTrains: affectedTrains.length,
        expectedDelayMinutes: totalDelay,
        criticalTrainsAffected,
        alternativeRoutesAvailable,
      },
    });
  }
}

module.exports = new PredictionService();