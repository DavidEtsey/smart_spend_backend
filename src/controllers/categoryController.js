const categoryModel = require('../models/categoryModel.js');

const categoryController = {
    async customizeCategory (req, res, next) {
        try{
            const customData = req.body;
            const user_id=req.user.user_id;

            const data = await categoryModel.customizeCategory(customData,user_id);
            res.status(201).json({
                message: 'Customized category created successful',
                data
            });

        } catch (error) {
            console.error('Error in customizeCategory:', error);
            next(error);
        }
    }
}

module.exports = categoryController; 
