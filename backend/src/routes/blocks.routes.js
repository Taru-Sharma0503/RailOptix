const express = require('express');
const router = express.Router();
const { getBlocks, getBlock, createBlock, deleteBlock, getAvailable, getConflicts } = require('../controllers/block.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateBlock } = require('../validators');

router.get('/', authenticateToken, getBlocks);
router.get('/available', authenticateToken, getAvailable);
router.get('/conflicts', authenticateToken, getConflicts);
router.get('/:id', authenticateToken, getBlock);
router.post('/', authenticateToken, validateBlock, createBlock);
router.delete('/:id', authenticateToken, deleteBlock);

module.exports = router;
