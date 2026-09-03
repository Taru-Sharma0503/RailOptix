const express = require('express');
const router = express.Router();
const { kpis, delays, availability } = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/kpis', authenticateToken, kpis);
router.get('/delays', authenticateToken, delays);
router.get('/availability', authenticateToken, availability);

module.exports = router;
