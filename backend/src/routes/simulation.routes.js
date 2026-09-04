const express = require('express');
const router = express.Router();
const { createSimulation, runSimulation, getSimulation, getResults } = require('../controllers/simulation.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateSimulation } = require('../validators');

router.post('/', authenticateToken, validateSimulation, createSimulation);
router.post('/:id/run', authenticateToken, runSimulation);
router.get('/:id', authenticateToken, getSimulation);
router.get('/:id/results', authenticateToken, getResults);

module.exports = router;
