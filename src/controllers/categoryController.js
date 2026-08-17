const categoryModel = require('../models/categoryModel.js');
const AppError = require('../utils/AppError.js');

const categoryController = {
    getCategories: async(req,res,next)=> {
        try{
            const { user_id } = req.user;
            const { type } = req.query;
            const validTypes = ["expense", "income", "transfer"];

            if (type && !validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid category type. Must be expense, income, or transfer."
            });
            }
            
            const categories = await categoryModel.getCategories(user_id,type);

            res.status(200).json({
                success: true,
                message: 'All categories retrieved successfully',
                data: categories
            });
        }catch (err) {
            next(err);
        }
    },

    customizeCategory: async (req, res, next) => {
        try {
            const { user_id } = req.user;
            const { type } = req.query; // Get the type from query parameters
            const {name} = req.body;
            const validTypes = ["income", "expense", "transfer"];

            // Validate type if provided
            if (type && !validTypes.includes(type.toLowerCase())) {
                throw new AppError("Invalid type. Must be 'income', 'expense', or 'transfer'", 400);
            }
            
            const data = await categoryModel.customizeCategory(user_id, type,name);

            res.status(200).json({
                success: true,
                message: 'Custom category created successfully',
                data
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = categoryController; 
