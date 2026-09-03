const express = require('express');
const router = express.Router();
const { getNetwork, getStations, getCorridors } = require('../controllers/network.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getNetwork);
router.get('/stations', authenticateToken, getStations);
router.get('/corridors', authenticateToken, getCorridors);

module.exports = router;
