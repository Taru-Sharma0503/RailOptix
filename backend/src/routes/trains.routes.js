const express = require('express');
const router = express.Router();
const { getTrains, getTrain, getTimetable } = require('../controllers/train.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getTrains);
router.get('/timetable', authenticateToken, getTimetable);
router.get('/:id', authenticateToken, getTrain);

module.exports = router;
