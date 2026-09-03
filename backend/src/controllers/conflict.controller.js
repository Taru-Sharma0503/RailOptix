const conflictService = require('../services/conflict.service');

async function getConflicts(req, res, next) {
  try { res.json(await conflictService.getConflicts(req.query)); } catch (err) { next(err); }
}
async function getConflict(req, res, next) {
  try { res.json(await conflictService.getConflictById(req.params.id)); } catch (err) { next(err); }
}
async function negotiate(req, res, next) {
  try { res.json(await conflictService.negotiate(req.body)); } catch (err) { next(err); }
}
async function resolve(req, res, next) {
  try { res.json(await conflictService.resolve(req.body)); } catch (err) { next(err); }
}

module.exports = { getConflicts, getConflict, negotiate, resolve };
