const networkService = require('../services/network.service');

async function getNetwork(req, res, next) {
  try {
    const result = await networkService.getNetwork(req.query.corridorId);
    res.json(result);
  } catch (err) { next(err); }
}

async function getStations(req, res, next) {
  try {
    const result = await networkService.getStations(req.query.corridorId);
    res.json(result);
  } catch (err) { next(err); }
}

async function getCorridors(req, res, next) {
  try {
    const result = await networkService.getCorridors();
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { getNetwork, getStations, getCorridors };
