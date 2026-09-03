const { instance: optimizationService } = require('../services/optimization.service');

async function optimize(req, res, next) {
  try { res.status(202).json(await optimizationService.startOptimization(req.body)); } catch (err) { next(err); }
}
async function getStatus(req, res, next) {
  try { res.json(await optimizationService.getStatus(req.params.runId)); } catch (err) { next(err); }
}
async function getResult(req, res, next) {
  try { res.json(await optimizationService.getResult(req.params.runId)); } catch (err) { next(err); }
}
async function getExplanation(req, res, next) {
  try { res.json(await optimizationService.getExplanation(req.params.runId)); } catch (err) { next(err); }
}

module.exports = { optimize, getStatus, getResult, getExplanation };
