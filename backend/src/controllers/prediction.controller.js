const predictionService = require('../services/prediction.service');

async function maintenancePriority(req, res, next) {
  try { res.json(await predictionService.predictMaintenancePriority(req.body)); } catch (err) { next(err); }
}
async function failureRisk(req, res, next) {
  try { res.json(await predictionService.predictFailureRisk(req.body)); } catch (err) { next(err); }
}
async function trafficImpact(req, res, next) {
  try { res.json(await predictionService.predictTrafficImpact(req.body)); } catch (err) { next(err); }
}

module.exports = { maintenancePriority, failureRisk, trafficImpact };
