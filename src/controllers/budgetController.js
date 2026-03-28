const budgetModel = require('../models/budgetModel.js');

const budgetController = {
    async createBudget(req, res, next) {
        try {
            const { category, amount_limit, period, start_date, end_date } = req.body;

            // 1. Required fields (flexible)
            if (!category || !amount_limit || !start_date) {
                return res.status(400).json({ message: "Category, amount, and start_date are required" });
            }
        
            // Either (end_date OR period) must exist
            if (!end_date && !period) {
                return res.status(400).json({message: "Provide either end_date or period"});
            }

            // 2. Validate amount
            if (isNaN(amount_limit) || amount_limit <= 0) {
                return res.status(400).json({ message: "Amount must be a greater than 0" });
            }
            
            // 3. Validate date format
            const start = new Date(start_date);
            const end = end_date ? new Date(end_date) : null;
        
            if (isNaN(start.getTime()) || (end_date && isNaN(end.getTime()))) {
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
            }
        
            // 4. Validate date logic
            if (start_date > end_date) {
                return res.status(400).json({ message: "Start date cannot be after end date" });
            }

            // 5. Validate period (if provided)
            if (period && (isNaN(period) || period <= 0)) {
                return res.status(400).json({
                    message: "Period must be a positive number"
                });
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
            //console.log("req.user:", req.user);
            //console.log(budgets);

            const formatted = budgets.map(b => {

                const remaining = b.amount_limit - b.spent;

                const progress =
                    b.amount_limit > 0
                    ? Number(((b.spent / b.amount_limit) * 100).toFixed(1))
                    : 0
                ;

                let status="Safe";

                if(progress >= 100){
                    status="Danger"
                }else if(progress >= 80){
                    status="Warning"
                }

                return {
                    budget_id: b.budget_id,
                    category: b.category,
                    amount_limit: b.amount_limit,
                    spent: b.spent,
                    remaining,
                    progress: progress +"%",
                    status,
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

        // ONLY the fields user can actually alter
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([k,v]) =>
                allowed.includes(k) && v != null)
        );

        // must update at least one
        if (!Object.keys(updates).length){
            return res.status(400).json({ error: 'Provide at least one field to update' });
        }

        // Basic validation layer
        if (updates.period && isNaN(Number(updates.period))) {
            return res.status(400).json({ error: 'Period must be a number' });
        }

        if (updates.amount_limit && isNaN(Number(updates.amount_limit))) {
            return res.status(400).json({ error: 'Amount limit must be a number' });
        }

        // Optional: validate date format
        if (updates.start_date && isNaN(new Date(updates.start_date))) {
            return res.status(400).json({ error: 'Invalid start_date format' });
        }

        if (updates.end_date && isNaN(new Date(updates.end_date))) {
            return res.status(400).json({ error: 'Invalid end_date format' });
        }
            
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