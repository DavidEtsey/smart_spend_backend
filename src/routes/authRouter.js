const express = require('express');
const authRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const authController = require('../controllers/authController.js');
const { loginLimiter } = require('../middleware/rateLimiter.js');
const { signUpValidation, signInValidation, validater } = require('../validations/authValidation.js');
const { updateProfileValidation, validate } = require('../validations/profileValidation.js');


// Public auth routes
authRouter.post('/signUp', signUpValidation, validater, authController.userSignUp);
authRouter.post('/signIn', loginLimiter, signInValidation,validater,authController.userSignIn);


// Profile routes
authRouter.get('/profile', verifyToken, authController.getProfile);
authRouter.get('/detailed_profile', verifyToken, authController.detailed_profile);
authRouter.put('/update_profile', verifyToken, updateProfileValidation, validate, authController.updateProfile);

//Password Related routes
authRouter.put('/passwordChange',verifyToken,authController.changePassword);

module.exports = authRouter; 