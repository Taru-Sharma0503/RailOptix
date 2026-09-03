const dashboardService = require('../services/dashboard.service');

async function overview(req, res, next) {
  try {
    const result = await dashboardService.getOverview(req.query.corridorId);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { overview };
