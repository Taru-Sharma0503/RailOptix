const express = require('express');
const router = express.Router();
const { getConflicts, getConflict, detectConflicts, negotiate, resolve } = require('../controllers/conflict.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateConflictDetect, validateConflictNegotiate, validateConflictResolve } = require('../validators');

router.get('/', authenticateToken, getConflicts);
router.get('/:id', authenticateToken, getConflict);
router.post('/detect', authenticateToken, validateConflictDetect, detectConflicts);
router.post('/negotiate', authenticateToken, validateConflictNegotiate, negotiate);
router.post('/resolve', authenticateToken, validateConflictResolve, resolve);

module.exports = router;