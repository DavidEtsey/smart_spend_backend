const rateLimit = require('express-rate-limit');

// Login rate limiter (STRICT)
const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts
  message: {
    message: 'Too many login attempts. Try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests. Please slow down.'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
