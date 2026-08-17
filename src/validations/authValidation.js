const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError.js');

// Sign Up Validation
const registerValidation = [

  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Full name must contain only letters and spaces"),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
];

// Sign In Validation
const logInValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      const isEmail = /\S+@\S+\.\S+/.test(value);

      if (!isEmail ) {
        throw new AppError('Must be a valid email', 400);
      }

      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];


// Central validation handler
const validater = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map(err => err.msg)
    });
  }

  next();
};

module.exports = {
  registerValidation,
  logInValidation,
  validater
};
