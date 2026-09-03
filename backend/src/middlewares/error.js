const { errorResponse } = require('../utils/helpers');
const env = require('../config/env');

function notFound(req, res) {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (env.nodeEnv === 'development' && statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  if (env.nodeEnv === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json(errorResponse(message, statusCode));
}

module.exports = { notFound, errorHandler };
