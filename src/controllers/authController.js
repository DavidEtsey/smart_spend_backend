const authModel = require('../models/authModel.js');
const verifyToken = require('../middleware/authMiddleware.js');
const AppError = require('../utils/AppError.js');

const authController = {
    async register(req, res, next) {
        try {
            const userData = req.body;

            const user = await authModel.signUp(userData);
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            console.error('Error in userSignUp:', error);
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            const result = await authModel.signIn(email, password);
            res.status(200).json({
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            console.error('Error in userSignIn:', error);
            next(error);
        }
    },

    async userLogout(req, res, next) {
        try {
            const userId = req.user.user_id;

            if (userId) {
                await verifyToken.revokeToken(userId);
            }

            res.status(200).json({
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Error in userLogout:', error);
            next(error);
        }
    },

    async refreshToken(req, res, next) {
        try {
            const presented = (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
                ? req.headers.authorization.split(' ')[1]
                : req.body.refresh_token;

            if (!presented) {
                throw new AppError('Refresh token required in Authorization header or body', 400);
            }

            const result = await authModel.refreshToken(presented);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    async getProfile(req, res, next) {
        try {
            const userId = req.user.user_id; 

            const profile = await authModel.getProfile(userId);
            res.status(200).json(profile);
        } catch (error) {
            console.error('Error in getProfile:', error);
            next(error);
        }
    },

    async detailed_profile(req, res, next) {
        try {
            const userId = req.user.user_id; 

            const profile = await authModel.detailed_profile(userId);

            if (!profile) {
                return res.status(404).json({
                    message: "Profile not found"
                });
            }
            //console.log("Profile from model:", profile);

            res.json({
                message: 'Detailed profile retrieved successfully',
                profile
            });
        }catch(error){
            console.error('Error in detailed_profile:', error);
            next(error);        
        }
    },

    async updateProfile (req,res,next){
        const allowed_updates = ['username', 'email', 'full_name'];
        
        // ONLY the fields user actually sent
        const updates = Object.fromEntries(             //converts array of key-value pairs back to an object, but only for allowed fields that are not null/undefined
            Object.entries(req.body).filter(([k,v]) =>  // Output: [["name", "David"], ["age", 17]}
            allowed_updates.includes(k) && v != null) // Filter out null/undefined values
        );
        
        // must update at least one
        if (!Object.keys(updates).length)
        return res.status(400).json({ error: 'Provide at least one field to update' });
        
        try{
            const data = await authModel.updateProfile(
                req.user.user_id,
                updates
            );
            //console.log("Profile from model:", data);

            if (!data) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json({
                message: 'Profile updated successfully',
                data: data
            });
        
        }catch(error){
            console.error('Error in update_profile:', error);
            next(error);
        }
    },

    async createNewPassword(req,res,next){
        try {
            const {newPassword,confirmPassword} = req.body;
            const {user_id} = req.user; 

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }

            const results=await authModel.createNewPassword(newPassword, user_id);

            if (!results) {
                return res.status(404).json({ message: 'Password not changed' });
            }

            res.json({
                message: 'Password changed successfully',
            })
        } catch (error) {
            console.error('Error in createNewPassword:', error);
            next(error);
        }
    },

    async forgotPassword(req,res,next){
        try {
            const { email } = req.body; 

            const result = await authModel.forgotPassword(email);

            res.status(201).json({ message: "If that email exists, a reset code has been sent." });

        } catch (error) {
            console.error('Error in forgotPassword:', error);
            next(error);
        }
    },

    async resetPassword(req,res,next){
        try {
            const { email, reset_code} = req.body;

            await authModel.resetPassword(email, reset_code);

            res.json({ message: "Password reset successfully." });

        } catch (error) {
            console.error('Error in resetPassword:', error);
            next(error);
        }
    }

};

module.exports = authController;