const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/history.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getHistory);

module.exports = router;
