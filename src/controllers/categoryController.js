const categoryModel = require('../models/categoryModel.js');
const AppError = require('../utils/AppError.js');

const categoryController = {
    async customizeCategory (req, res, next) {
        try {
            const { name, icon, type, user_id: isUserCreated } = req.body;
            const user_id = req.user.user_id;

            // Validate required fields
            if (!name) {
                throw new AppError("Category name is required", 400);
            }

            // Logic for user-created vs global categories
            if (isUserCreated) {
                // User-created category: type is required
                if (!type || !["income", "expense", "transfer"].includes(type)) {
                    throw new AppError("User categories require type: income, expense, or transfer", 400);
                }
            } else {
                // Global category: type must be null
                if (type !== null && type !== undefined) {
                    throw new AppError("Global categories must have type: null", 400);
                }
            }

            const customData = {
                name,
                icon: icon || null,
                type: isUserCreated ? type : null,
                user_id: isUserCreated ? user_id : null
            };

            const data = await categoryModel.customizeCategory(customData, user_id);

            if (!data) {
                throw new AppError("Failed to create category", 500);
            }

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data
            });

        } catch (err) {
            next(err);
        }
    }
}

module.exports = categoryController; 
