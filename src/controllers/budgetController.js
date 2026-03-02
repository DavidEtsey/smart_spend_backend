const budgetModel = require('../models/budgetModel.js');

const budgetController = {
    async createBudget(req, res, next) {
        try {
            const { category, amount_limit, period, start_date, end_date} = req.body;

            // 1. Check required fields
              if (!category || !amount_limit || !start_date || !end_date) {
                return res.status(400).json({ message: "All fields are required" });
              }
            
              // 2. Validate amount
              if (isNaN(amount_limit) || amount_limit <= 0) {
                return res.status(400).json({ message: "Amount must be a greater than 0" });
              }
            
              // 3. Validate date format
              const start = new Date(start_date);
              const end = new Date(end_date);
            
              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
              }
            
              // 4. Validate date logic
              if (start_date > end_date) {
                return res.status(400).json({ message: "Start date cannot be after end date" });
              }

            const budget = await budgetModel.createBudget({
                user_id: req.user.user_id,
                category,
                amount_limit,
                period,
                start_date,
                end_date,
            });

            res.status(201).json({
            message: 'Budget created successfully',
            data: budget
            });
        } catch (error) {
            console.error('Error in createBudget:', error);
            next(error);
        }
    },

    async getBudget(req, res, next) {
        try{
            const budgets = await budgetModel.getBudgetsWithSpent(req.user.user_id);
            console.log(budgets);

            
            const formatted = budgets.map(b => {
                console.log({
                    limit: b.amount_limit,
                    spent: b.spent,
                    typeLimit: typeof b.amount_limit,
                    typeSpent: typeof b.spent
                });

                const remaining = b.amount_limit - b.spent;

                const progress =
                    b.amount_limit > 0
                    ? Number(((b.spent / b.amount_limit) * 100).toFixed(1))+'%'
                    : 0;

                return {
                    budget_id: b.budget_id,
                    category: b.category,
                    amount_limit: b.amount_limit,
                    spent: b.spent,
                    remaining,
                    progress,
                    period: b.period
                };
            });

            res.json({
                message: 'Budgets retrieved successfully',
                data: formatted
            });

        }catch (error) {
            console.error('Error in getBudget:', error);
            next(error);
        }
    },

    async updateBudget (req,res,next) {
        const allowed = ['category', 'amount_limit', 'period', 'start_date', 'end_date' ];

        // ONLY the fields user actually altered
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([k,v]) =>
                allowed.includes(k) && v != null)
        );

        // must update at least one
        if (!Object.keys(updates).length)
        return res.status(400).json({ error: 'Provide at least one field to update' });
            
        try{
            const updated = await budgetModel.updateBudget(
                req.params.budget_id,
                req.user.user_id,
                updates
            );

            if (!updated) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            res.json({
                message: 'Budget updated successfully',
                data: updated
            });

        }catch(error) {
            console.error('Error in updatedBudget:', error);
            next(error);
        }
    },

    async deleteBudget (req,res,next){
        try{
            const deleted = await budgetModel.deleteBudget(
            req.params.budget_id,
            req.user.user_id
        );

        if (!deleted) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json({
        message: 'Budget deleted successfully'
        });

        }catch(error){
            console.error('Error in deleteBudget:', error);
            next(error);
        }
    }
    
}

module.exports = budgetController; 