const expenseModel = require('../models/expenseModel.js');
const AppError = require('../utils/AppError.js');

const expenseController = {
    async createExpense(req, res, next) {
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

            const expense = await expenseModel.createExpense({
                user_id: req.user.user_id,
                amount: Number(amount),
                category_id: parseInt(category_id),
                account_id: parseInt(account_id),
                description,
                currency: finalCurrency
            });

            if (!expense) {
                throw new AppError("Failed to create expense record", 500);
            }

            res.status(201).json({
                success: true,
                message: "Expense recorded successfully",
                expense
            });

        } catch (error) {
            next(error);
        }
    },

    async getExpensesByUser(req, res, next) {
        try {
            const expenses = await expenseModel.getExpensesByUser(req.user.user_id);

            if (!expenses || expenses.length === 0) {
                return res.json({
                    success: true,
                    total: 0,
                    message: "No expenses recorded yet",
                    data: []
                });
            }

            const safeData = expenses.map(e => ({
                expense_id: e.expense_id,
                amount: e.amount,
                category_id: e.category_id,
                account_id: e.account_id,
                description: e.description,
                currency: e.currency,
                created_at: e.created_at
            }));

            res.json({
                success: true,
                total: expenses.length,
                data: safeData
            });
        } catch (error) {
            next(error);
        }
    },

    async updateExpense(req, res, next) {
        try {
            const allowedFields = ['amount', 'category_id', 'account_id', 'description', 'currency'];

            // Fields that user actually altered
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([k,v]) =>
                    allowedFields.includes(k) && v != null)
            );

            // Must update at least one
            if (!Object.keys(updates).length) {
                throw new AppError('Provide at least one field to update', 400);
            }

            // Convert IDs to integers if provided
            if (updates.category_id) updates.category_id = parseInt(updates.category_id);
            if (updates.account_id) updates.account_id = parseInt(updates.account_id);
            if (updates.amount) updates.amount = Number(updates.amount);

            const data = await expenseModel.updateExpense(
                req.params.expense_id,
                req.user.user_id,
                updates
            );

            if (!data) {
                throw new AppError('Expense not found or unauthorized', 404);
            }

            res.json({
                success: true,
                message: 'Expense updated successfully',
                data: data
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteExpense(req, res, next) {
        try {
            const deleted = await expenseModel.deleteExpense(
                req.params.expense_id,
                req.user.user_id
            );

            if (!deleted) {
                throw new AppError('Expense not found or unauthorized', 404);
            }

            res.json({
                success: true,
                message: 'Expense deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllExpenses(req, res, next) {
        try {
            const expenses = await expenseModel.getAllExpenses();

            if (!expenses || expenses.length === 0) {
                return res.json({
                    success: true,
                    total: 0,
                    message: "No expenses found",
                    data: []
                });
            }

            res.json({
                success: true,
                total: expenses.length,
                data: expenses
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = expenseController; 