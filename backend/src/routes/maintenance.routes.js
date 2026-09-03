const express = require('express');
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, importTasks } = require('../controllers/maintenance.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateMaintenance } = require('../validators');

router.get('/', authenticateToken, getTasks);
router.get('/:id', authenticateToken, getTask);
router.post('/', authenticateToken, validateMaintenance, createTask);
router.post('/import', authenticateToken, importTasks);
router.put('/:id', authenticateToken, validateMaintenance, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

module.exports = router;
