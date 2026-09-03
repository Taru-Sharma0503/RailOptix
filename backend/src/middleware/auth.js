const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');
const { errorResponse } = require('../utils/helpers');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(errorResponse('Authentication required. Please provide a valid token.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token expired. Please log in again.', 401));
    }
    return res.status(401).json(errorResponse('Invalid token. Please log in again.', 401));
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = decoded;
    } catch (err) {
      // silently ignore — optional auth
    }
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };
