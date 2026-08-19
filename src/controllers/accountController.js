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
            const {name} = req.body;
            
            const data = await accountModel.customizeAccount(user_id, name);

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
