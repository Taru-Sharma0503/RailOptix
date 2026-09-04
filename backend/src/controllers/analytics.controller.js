const analyticsService = require('../services/analytics.service');

async function kpis(req, res, next) {
  try { res.json(await analyticsService.getKpis(req.query)); } catch (err) { next(err); }
}
async function delays(req, res, next) {
  try { res.json(await analyticsService.getDelays(req.query)); } catch (err) { next(err); }
}
async function availability(req, res, next) {
  try { res.json(await analyticsService.getAvailability(req.query)); } catch (err) { next(err); }
}

module.exports = { kpis, delays, availability };
