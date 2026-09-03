const assetService = require('../services/asset.service');

async function getAssets(req, res, next) {
  try { res.json(await assetService.getAssets(req.query)); } catch (err) { next(err); }
}
async function getAsset(req, res, next) {
  try { res.json(await assetService.getAssetById(req.params.id)); } catch (err) { next(err); }
}
async function createAsset(req, res, next) {
  try { res.status(201).json(await assetService.createAsset(req.body)); } catch (err) { next(err); }
}
async function updateAsset(req, res, next) {
  try { res.json(await assetService.updateAsset(req.params.id, req.body)); } catch (err) { next(err); }
}
async function deleteAsset(req, res, next) {
  try { res.json(await assetService.deleteAsset(req.params.id)); } catch (err) { next(err); }
}
async function getAssetHistory(req, res, next) {
  try { res.json(await assetService.getAssetHistory(req.params.id)); } catch (err) { next(err); }
}
async function getAssetRisk(req, res, next) {
  try { res.json(await assetService.getAssetRisk(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getAssets, getAsset, createAsset, updateAsset, deleteAsset, getAssetHistory, getAssetRisk };
