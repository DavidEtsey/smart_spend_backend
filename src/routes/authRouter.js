const express = require('express');
const authRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const authController = require('../controllers/authController.js');
const { loginLimiter,apiLimiter } = require('../middleware/rateLimiter.js');
const { registerValidation, logInValidation, validater } = require('../validations/authValidation.js');
const { updateProfileValidation, validate } = require('../validations/profileValidation.js');


// Public auth routes
authRouter.post('/register', registerValidation, validater, authController.register);
authRouter.post('/login', loginLimiter, logInValidation,validater,authController.login);
authRouter.post('/refresh_token', authController.refreshToken);
authRouter.post('/logout', verifyToken, authController.userLogout);

// Profile routes
authRouter.get('/profile', verifyToken, authController.getProfile);
authRouter.get('/detailed_profile', verifyToken, authController.detailed_profile);
authRouter.put('/update_profile', verifyToken, updateProfileValidation, validate, authController.updateProfile);

//Password routes
authRouter.put('/createNewPassword',verifyToken,authController.createNewPassword);
authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.post('/resetPassword', authController.resetPassword);

        
module.exports = authRouter; 