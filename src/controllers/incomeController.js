const incomeModel = require('../models/incomeModel.js');
const AppError = require('../utils/AppError.js');

const incomeController ={
    async addIncome(req, res, next) {
        try {
            const { category_id, account_id, amount, description, currency } = req.body;

            // Validate required fields
            if (!amount || !category_id || !account_id || !description) {
                throw new AppError("Amount, category_id, account_id, and description are required", 400);
            }

            // Amount must be a number and positive
            if (isNaN(amount) || Number(amount) <= 0) {
                throw new AppError("Amount must be a positive number", 400);
            }

            // Amount should not be unreasonably large
            if (Number(amount) > 100000000) {
                throw new AppError("Amount too large", 400);
            }

            // Validate IDs are positive integers
            if (!Number.isInteger(parseInt(category_id)) || parseInt(category_id) <= 0) {
                throw new AppError("Invalid category_id", 400);
            }

            if (!Number.isInteger(parseInt(account_id)) || parseInt(account_id) <= 0) {
                throw new AppError("Invalid account_id", 400);
            }

            // Use GHS as default currency if not provided
            const finalCurrency = currency || "GHS";

            const income = await incomeModel.createIncome({
                user_id: req.user.user_id,
                amount: Number(amount),
                category_id: parseInt(category_id),
                account_id: parseInt(account_id),
                description,
                currency: finalCurrency
            });
            
            if (!income) {
                throw new AppError("Failed to create income record", 500);
            }

            res.status(201).json({
                success: true,
                message: "Income recorded successfully",
                income
            });

        } catch (err) {
            next(err);
        }
    },

    async getIncome(req, res, next) {
        try {
            const incomes = await incomeModel.getUserIncome(req.user.user_id);

            if (!incomes || incomes.length === 0) {
                return res.json({
                    success: true,
                    total: 0,
                    message: "No incomes recorded yet",
                    data: []
                });
            }

            const safeData = incomes.map(i => ({
                income_id: i.income_id,
                amount: i.amount,
                category_id: i.category_id,
                account_id: i.account_id,
                description: i.description,
                currency: i.currency,
                received_at: i.received_at
            }));

            res.json({
                success: true,
                total: incomes.length,
                data: safeData
            });

        } catch (err) {
            next(err);
        }
    },

    async updateIncome(req,res,next){
        try{
            const allowedFields=['amount', 'category_id', 'account_id', 'description', 'currency'];

            //Fields that user actually altered
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([k,v]) =>
                    allowedFields.includes(k) && v != null)
            );

            // must update at least one
            if (!Object.keys(updates).length) {
                throw new AppError('Provide at least one field to update', 400);
            }

            // Convert IDs to integers if provided
            if (updates.category_id) updates.category_id = parseInt(updates.category_id);
            if (updates.account_id) updates.account_id = parseInt(updates.account_id);
            if (updates.amount) updates.amount = Number(updates.amount);

            const data = await incomeModel.updateIncome(
                req.params.income_id,
                req.user.user_id,
                updates
            );

            if (!data) {
                throw new AppError('Income not found or unauthorized', 404);
            }

            res.json({
                success: true,
                message: 'Income updated successfully',
                data: data
            });
        } catch (err) {
            next(err);
        }
    },

    async deleteIncome(req,res,next){
        try {
            const deleted = await incomeModel.deleteIncome(
                req.params.income_id,
                req.user.user_id
            );
            
            if (!deleted) {
                throw new AppError('Income not found or unauthorized', 404);
            }

            res.json({
                success: true,
                message: 'Income deleted successfully',
            });
        } catch (err) {
            next(err); 
        }
    }
}

module.exports = incomeController;