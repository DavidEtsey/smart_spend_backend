const { body, validationResult } = require('express-validator');

// Sign Up Validation
const signUpValidation = [

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

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
const signInValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required')
    .custom((value) => {
      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);

      if (!isEmail && !isUsername) {
        throw new Error('Must be a valid username or email');
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
  signUpValidation,
  signInValidation,
  validater
};
