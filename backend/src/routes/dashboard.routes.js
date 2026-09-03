const express = require('express');
const router = express.Router();
const { overview } = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/overview', authenticateToken, overview);

module.exports = router;
