const planningService = require('../services/planning.service');

async function weekly(req, res, next) {
  try { res.json(await planningService.getWeekly(req.query.startDate)); } catch (err) { next(err); }
}
async function monthly(req, res, next) {
  try { res.json(await planningService.getMonthly(req.query.month)); } catch (err) { next(err); }
}
async function approve(req, res, next) {
  try { res.status(201).json(await planningService.approvePlan(req.body)); } catch (err) { next(err); }
}

module.exports = { weekly, monthly, approve };
