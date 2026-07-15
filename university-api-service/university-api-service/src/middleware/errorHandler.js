const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    statusCode: 404,
  });
}

function globalErrorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    logger.warn(`${err.statusCode} ${err.name}: ${err.message} [${req.method} ${req.originalUrl}]`);
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err.stack || err.message}`);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  });
}

module.exports = { notFoundHandler, globalErrorHandler };
