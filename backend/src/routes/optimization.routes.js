const express = require('express');
const router = express.Router();
const { optimize, getStatus, getResult, getExplanation } = require('../controllers/optimization.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateOptimize } = require('../validators');

router.post('/', authenticateToken, validateOptimize, optimize);
router.get('/:runId', authenticateToken, getStatus);
router.get('/:runId/result', authenticateToken, getResult);
router.get('/:runId/explanation', authenticateToken, getExplanation);

module.exports = router;
