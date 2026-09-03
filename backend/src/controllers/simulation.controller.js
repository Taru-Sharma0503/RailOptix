const { instance: simulationService } = require('../services/simulation.service');

async function createSimulation(req, res, next) {
  try { res.status(201).json(await simulationService.createScenario(req.body)); } catch (err) { next(err); }
}
async function runSimulation(req, res, next) {
  try { res.status(202).json(await simulationService.runScenario(req.params.id)); } catch (err) { next(err); }
}
async function getSimulation(req, res, next) {
  try { res.json(await simulationService.getScenario(req.params.id)); } catch (err) { next(err); }
}
async function getResults(req, res, next) {
  try { res.json(await simulationService.getResults(req.params.id)); } catch (err) { next(err); }
}

module.exports = { createSimulation, runSimulation, getSimulation, getResults };
