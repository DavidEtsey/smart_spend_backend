const { body, validationResult } = require('express-validator');

// Update profile validation (fields optional)
const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .isAlpha(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),

  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Full name must contain only letters and spaces')
    .isAlpha(),
];

// Central validation handler
const validate = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map(err => err.msg)
    });
  }

  next();
};

module.exports = {
  updateProfileValidation,
  validate
};
