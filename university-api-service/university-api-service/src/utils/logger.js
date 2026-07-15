const winston = require('winston');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
  ),
  transports: isTest
    ? [new winston.transports.Console({ silent: true })]
    : [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(__dirname, '..', '..', 'logs', 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(__dirname, '..', '..', 'logs', 'combined.log'),
        }),
      ],
});

module.exports = logger;
