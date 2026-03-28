const expenseModel = require('../models/expenseModel.js');

const expenseController = {
    async createExpense(req, res, next) {
        try {
            const expense = {
                user_id: req.user.user_id,
                amount: req.body.amount,
                description: req.body.description,
                category: req.body.category,
            };

            //console.log("req.user:", req.user);

            const newExpense = await expenseModel.createExpense(expense);                          
            res.status(201).json({
                message: 'New expenses successfully',
                newExpense
            });
        } catch (error) {
            console.error('Error in createExpense:', error);
            next(error);
        }
    },

    async getExpensesByUser(req, res, next) {
        
        try {
            const expenses = await expenseModel.getExpensesByUser(req.user.user_id);
            res.json({
                message: 'Expenses retrieved successfully',
                data: expenses
            }); 
        } catch (error) {
            console.error('Error in getExpensesByUser:', error);
            next(error); 
        }
    },

    async updateExpense(req, res, next) {
        try {
            const allowed = ['amount', 'description', 'category'];

            // ONLY the fields user actually sent
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([k,v]) =>
                    allowed.includes(k) && v != null)
            );

            // must update at least one
            if (!Object.keys(updates).length)
            return res.status(400).json({ error: 'Provide at least one field to update' });
                

            const data = await expenseModel.updateExpense(
                req.params.expense_id,
                req.user.user_id,
                updates
            );
            
            const updated = data;
            /*
            if (!updated) {
                return res.status(404).json({ error: 'Expense not found or unauthorized' });
            }*/

            res.json({
                message: 'Expense updated successfully',
                data: updated
            });
        } catch (error) {
            console.error('Error in updateExpense:', error);
            next(error); 
        }
    },

    async deleteExpense(req, res, next) {
        try {
            const deleted = await expenseModel.deleteExpense(
                Number(req.params.expense_id),
                Number(req.user.user_id)
            );
            if (!deleted) {
                return res.status(404).json({ error: 'Expense not deleted' });
            }
            res.json({
                message: 'Expense deleted successfully',
            });
        } catch (error) {
            console.error('Error in deleteExpense:', error);
            next(error); 
        }
    },

    async getAllExpenses(req, res, next) {
        try {
            const expenses = await expenseModel.getAllExpenses();
            res.json({
                message: 'All expenses retrieved successfully',
                data: expenses
            });
        } catch (error) {
            console.error('Error in getAllExpenses:', error);
            next(error); 
        }
    },   
}

module.exports = expenseController; 