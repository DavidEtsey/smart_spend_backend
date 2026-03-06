const authModel = require('../models/authModel.js');

const authController = {
    async userSignUp(req, res, next) {
        try {
            const userData = req.body;

            /* Validate required fields
            const requiredFields = ['username', 'password', 'email'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    return next(new Error(`${field} is required`));
                }
            }*/

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

    async userSignIn(req, res, next) {
        try {
            const { identifier, password } = req.body;

            /* Validate required fields
            if (!identifier || !password) {
                return next(new Error('Username or email and password are required'));
            }*/

            const result = await authModel.signIn({ identifier, password });
            res.json({
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            console.error('Error in userSignIn:', error);
            next(error);
        }
    },

    async getProfile(req, res, next) {
        try {
            const userId = req.user.user_id; 

            const profile = await authModel.getProfile(userId);
            res.json(profile);
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
            console.log("Profile from model:", profile);

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
            console.log("Profile from model:", data);

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
    }
};

module.exports = authController;