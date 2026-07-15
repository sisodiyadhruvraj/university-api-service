const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests, please try again later.',
    statusCode: 429,
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = limiter;
