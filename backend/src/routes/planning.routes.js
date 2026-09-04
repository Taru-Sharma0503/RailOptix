const express = require('express');
const router = express.Router();
const { weekly, monthly, approve } = require('../controllers/planning.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/weekly', authenticateToken, weekly);
router.get('/monthly', authenticateToken, monthly);
router.post('/approve', authenticateToken, approve);

module.exports = router;
