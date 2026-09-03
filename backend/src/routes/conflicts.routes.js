const express = require('express');
const router = express.Router();
const { getConflicts, getConflict, negotiate, resolve } = require('../controllers/conflict.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getConflicts);
router.get('/:id', authenticateToken, getConflict);
router.post('/negotiate', authenticateToken, negotiate);
router.post('/resolve', authenticateToken, resolve);

module.exports = router;
