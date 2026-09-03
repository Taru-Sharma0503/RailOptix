const maintenanceRepo = require('../repositories/maintenance.repository');
const assetRepo = require('../repositories/asset.repository');
const blockRepo = require('../repositories/block.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse, timeToMinutes, timesOverlap, clamp, daysBetween } = require('../utils/helpers');

class PredictionService {
  async predictMaintenancePriority({ taskIds }) {
    if (!taskIds || !Array.isArray(taskIds)) {
      return successResponse({
        predictions: [],
        message: 'Provide taskIds array for priority predictions',
      });
    }

    const predictions = [];
    for (const taskId of taskIds) {
      const task = await maintenanceRepo.findById(taskId);
      if (!task) continue;

      const asset = await assetRepo.findById(task.assetId);
      const failures = await historicalFailureRepo.findByAssetId(task.assetId);

      const severityScore = (task.severity / 10) * 30;
      const criticalityScore = ((asset ? asset.criticality : 5) / 10) * 20;
      const riskScore = (task.failureRisk || 0.5) * 20;
      const safetyScore = ((task.safetyRisk || 5) / 10) * 15;

      let overdueScore = 0;
      if (task.deadline) {
        const daysUntilDeadline = daysBetween(new Date(), task.deadline);
        if (daysUntilDeadline < 0) overdueScore = 15;
        else if (daysUntilDeadline <= 3) overdueScore = 10;
        else if (daysUntilDeadline <= 7) overdueScore = 5;
      }

      const totalScore = severityScore + criticalityScore + riskScore + safetyScore + overdueScore;

      predictions.push({
        taskId: task.id,
        description: task.description,
        priorityScore: parseFloat(totalScore.toFixed(2)),
        recommendedAction: totalScore > 70 ? 'immediate' : totalScore > 50 ? 'high_priority' : totalScore > 30 ? 'scheduled' : 'routine',
        estimatedUrgency: totalScore > 70 ? 'Critical — address within 24h' : totalScore > 50 ? 'High — address within 3 days' : 'Normal scheduling',
        factors: {
          severity: { value: task.severity, score: parseFloat(severityScore.toFixed(2)) },
          assetCriticality: { value: asset ? asset.criticality : 5, score: parseFloat(criticalityScore.toFixed(2)) },
          failureRisk: { value: task.failureRisk || 0, score: parseFloat(riskScore.toFixed(2)) },
          safetyRisk: { value: task.safetyRisk || 5, score: parseFloat(safetyScore.toFixed(2)) },
          overdue: { value: task.deadline, score: overdueScore },
        },
      });
    }

    predictions.sort((a, b) => b.priorityScore - a.priorityScore);

    return successResponse({ predictions });
  }

  async predictFailureRisk({ assetIds }) {
    if (!assetIds || !Array.isArray(assetIds)) {
      return successResponse({
        predictions: [],
        message: 'Provide assetIds array for failure risk predictions',
      });
    }

    const predictions = [];
    for (const assetId of assetIds) {
      const asset = await assetRepo.findById(assetId);
      if (!asset) continue;

      const failures = await historicalFailureRepo.findByAssetId(assetId);
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

      const failureRisk = clamp(conditionScore + criticalityScore + defectScore + failureScore + ageScore, 0, 1);
      const riskLevel = failureRisk >= 0.7 ? 'high' : failureRisk >= 0.4 ? 'medium' : 'low';

      const recommendedActions = [];
      if (failureRisk >= 0.7) recommendedActions.push('Immediate inspection and preventive maintenance');
      if (asset.condition === 'critical') recommendedActions.push('Replace or repair asset urgently');
      if (failureCount > 3) recommendedActions.push('Investigate recurring failure patterns');
      if (ageYears > 20) recommendedActions.push('Plan asset renewal');
      if (recommendedActions.length === 0) recommendedActions.push('Continue routine monitoring');

      predictions.push({
        assetId: asset.id,
        assetName: asset.name,
        failureRisk: parseFloat(failureRisk.toFixed(2)),
        riskLevel,
        predictedFailureWindow: failureRisk >= 0.7 ? '7-14 days' : failureRisk >= 0.4 ? '30-60 days' : '90+ days',
        recommendedActions,
        factors: [
          { factor: 'Condition', value: asset.condition, contribution: parseFloat(conditionScore.toFixed(3)) },
          { factor: 'Criticality', value: asset.criticality, contribution: parseFloat(criticalityScore.toFixed(3)) },
          { factor: 'Defect Severity', value: asset.defectSeverity, contribution: parseFloat(defectScore.toFixed(3)) },
          { factor: 'Historical Failures', value: failureCount, contribution: parseFloat(failureScore.toFixed(3)) },
          { factor: 'Asset Age', value: parseFloat(ageYears.toFixed(1)) + ' years', contribution: parseFloat(ageScore.toFixed(3)) },
        ],
      });
    }

    predictions.sort((a, b) => b.failureRisk - a.failureRisk);

    return successResponse({ predictions });
  }

  async predictTrafficImpact({ corridorId, date, blockStart, blockEnd, maintenanceDuration, trainScheduleDate }) {
    const trainSchedules = await trainScheduleRepo.findWithFilters({
      corridorId,
      date: trainScheduleDate || date,
    });

    const affectedTrains = [];
    let totalDelay = 0;

    for (const ts of trainSchedules) {
      if (blockStart && blockEnd && timesOverlap(blockStart, blockEnd, ts.arrivalTime, ts.departureTime)) {
        const overlapStart = Math.max(timeToMinutes(blockStart), timeToMinutes(ts.arrivalTime));
        const overlapEnd = Math.min(timeToMinutes(blockEnd), timeToMinutes(ts.departureTime));
        const delay = Math.min(overlapEnd - overlapStart, 45);
        affectedTrains.push({
          trainId: ts.trainId,
          trainName: ts.trainName,
          trainNumber: ts.trainNumber,
          trainType: ts.trainType,
          priority: ts.trainPriority,
          expectedDelay: delay,
        });
        totalDelay += delay;
      }
    }

    const criticalTrains = affectedTrains.filter((t) => t.priority >= 7);
    const expressTrains = affectedTrains.filter((t) => t.trainType === 'express' || t.trainType === 'superfast');

    const trainDensity = trainSchedules.length;
    const densityScore = clamp(trainDensity / 20, 0, 1);
    const delayScore = clamp(totalDelay / 200, 0, 1);
    const criticalScore = clamp(criticalTrains.length / 5, 0, 1);

    const overallImpact = clamp((densityScore * 0.3 + delayScore * 0.4 + criticalScore * 0.3), 0, 1);
    const impactLevel = overallImpact >= 0.7 ? 'high' : overallImpact >= 0.4 ? 'medium' : 'low';

    const alternativeRoutes = trainSchedules.length > 5
      ? ['Consider rerouting via alternate corridor', 'Stagger block windows to reduce overlap']
      : ['Minimal impact expected — proceed with planned block'];

    return successResponse({
      corridorId,
      date: trainScheduleDate || date,
      trainDensity,
      affectedTrainCount: affectedTrains.length,
      affectedTrains,
      totalExpectedDelay: totalDelay,
      averageDelay: affectedTrains.length > 0 ? parseFloat((totalDelay / affectedTrains.length).toFixed(1)) : 0,
      criticalTrainsAffected: criticalTrains.length,
      expressTrainsAffected: expressTrains.length,
      overallImpact: parseFloat(overallImpact.toFixed(2)),
      impactLevel,
      alternativeRoutes,
    });
  }
}

module.exports = new PredictionService();
