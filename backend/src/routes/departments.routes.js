const express = require('express');
const router = express.Router();
const { getDepartments, getDepartment } = require('../controllers/department.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getDepartments);
router.get('/:id', authenticateToken, getDepartment);

module.exports = router;
