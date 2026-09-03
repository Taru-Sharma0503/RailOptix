const historyService = require('../services/history.service');

async function getHistory(req, res, next) {
  try { res.json(await historyService.getHistory(req.query)); } catch (err) { next(err); }
}

module.exports = { getHistory };
