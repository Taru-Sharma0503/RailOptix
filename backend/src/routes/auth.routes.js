const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, me);

module.exports = router;
