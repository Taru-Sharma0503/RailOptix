const blockService = require('../services/block.service');

async function getBlocks(req, res, next) {
  try { res.json(await blockService.getBlocks(req.query)); } catch (err) { next(err); }
}
async function getBlock(req, res, next) {
  try { res.json(await blockService.getBlockById(req.params.id)); } catch (err) { next(err); }
}
async function createBlock(req, res, next) {
  try { res.status(201).json(await blockService.createBlock(req.body)); } catch (err) { next(err); }
}
async function deleteBlock(req, res, next) {
  try { res.json(await blockService.deleteBlock(req.params.id)); } catch (err) { next(err); }
}
async function getAvailable(req, res, next) {
  try { res.json(await blockService.getAvailableSlots(req.query)); } catch (err) { next(err); }
}
async function getConflicts(req, res, next) {
  try { res.json(await blockService.getBlockConflicts(req.query)); } catch (err) { next(err); }
}

module.exports = { getBlocks, getBlock, createBlock, deleteBlock, getAvailable, getConflicts };
