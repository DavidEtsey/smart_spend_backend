const accountModel = require('../models/accountModel.js');
const AppError = require('../utils/AppError.js');

const accountController = {
    getAccounts: async(req,res,next)=> {
        try{
            const { user_id } = req.user;
            const accounts = await accountModel.getAccounts(user_id);

            res.status(200).json({
                success: true,
                message: 'Custom accounts retrieved successfully',
                data: accounts
            });
        }catch (err) {
            next(err);
        }
    },

    customizeAccount: async (req, res, next) => {
        try {
            const { user_id } = req.user;
            const { type } = req.query; // Get the type from query parameters
            const {name} = req.body;
            const validTypes = ["income", "expense", "transfer"];

            // Validate type if provided
            if (type && !validTypes.includes(type.toLowerCase())) {
                throw new AppError("Invalid type. Must be 'income', 'expense', or 'transfer'", 400);
            }
            
            const data = await accountModel.customizeAccount(user_id, type,name);

            res.status(200).json({
                success: true,
                message: 'Custom account created successfully',
                data
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = accountController; 
