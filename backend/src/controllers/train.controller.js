const trainService = require('../services/train.service');

async function getTrains(req, res, next) {
  try { res.json(await trainService.getTrains(req.query)); } catch (err) { next(err); }
}
async function getTrain(req, res, next) {
  try { res.json(await trainService.getTrainById(req.params.id)); } catch (err) { next(err); }
}
async function getTimetable(req, res, next) {
  try { res.json(await trainService.getTimetable(req.query)); } catch (err) { next(err); }
}

module.exports = { getTrains, getTrain, getTimetable };
