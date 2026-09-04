const express = require('express');
const router = express.Router();
const { getAssets, getAsset, createAsset, updateAsset, deleteAsset, getAssetHistory, getAssetRisk, addAssetFailure } = require('../controllers/asset.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateAsset } = require('../validators');

router.get('/', authenticateToken, getAssets);
router.get('/:id', authenticateToken, getAsset);
router.post('/', authenticateToken, validateAsset, createAsset);
router.put('/:id', authenticateToken, validateAsset, updateAsset);
router.delete('/:id', authenticateToken, deleteAsset);
router.get('/:id/history', authenticateToken, getAssetHistory);
router.get('/:id/risk', authenticateToken, getAssetRisk);
router.post('/:id/failures', authenticateToken, addAssetFailure);

module.exports = router;