const express = require('express');
const router = express.Router();
const { maintenancePriority, failureRisk, trafficImpact } = require('../controllers/prediction.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/maintenance-priority', authenticateToken, maintenancePriority);
router.post('/failure-risk', authenticateToken, failureRisk);
router.post('/traffic-impact', authenticateToken, trafficImpact);

module.exports = router;
