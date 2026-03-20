const incomeModel = require('../models/incomeModel.js');

const incomeController ={
    async addIncome(req, res, next) {

        try {

            const { amount, source, method, description} = req.body;

            const allowedMethods = [
                "Cash",
                "Mobile Money",
                "Bank Transfer",
                "Cheque"
            ];

            // 1. Required fields
            if (!amount || !method) {
                return res.status(400).json({
                    message: "Amount and method are required"
                });
            }

            // 2. Amount must be a number
            if (isNaN(amount) || Number(amount) <= 0) {
                return res.status(400).json({
                    message: "Amount must be a positive number"
                });
            }

            // 2. Amount should not be unreasonably large
            if (Number(amount) > 100000000) {
                return res.status(400).json({
                    message: "Amount too large"
                });
            }

            // 4. Validate method
            if (!allowedMethods.includes(method)) {
                return res.status(400).json({
                    message: "Invalid payment method"
                });
            }
            console.log(typeof(amount))

            const income = await incomeModel.createIncome({
                user_id: req.user.user_id,
                amount: Number(amount),
                source,
                method,
                description
            });
            

            res.status(201).json({
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

            const safeData= incomes.map( i =>({
                source: i.source,
                amount:i.amount,
                method:i.method,
                description:i.description
            }))

            res.json({
                total: incomes.length,
                safeData
            });

        } catch (err) {
            next(err);
        }
    },

    async updateIncome(req,res,next){
        try{
            const allowedFields=['source', 'amount', 'method', 'description']

            //Fields that user actually altered
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([k,v]) =>
                    allowedFields.includes(k) && v != null)
            );

            // must update at least one
            if (!Object.keys(updates).length)
            return res.status(400).json({ error: 'Provide at least one field to update' });
        

            const data = await incomeModel.updateIncome(
                req.params.income_id,
                req.user.user_id,
                updates
            );


            res.json({
                message: 'Expense updated successfully',
                data: data
            });
        }catch (err) {
            next(err)
        }
    },

    async deleteIncome(req,res,next){
        try {
            const deleted = await incomeModel.deleteIncome(
                req.params.income_id,
                req.user.user_id
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
    }
}

module.exports = incomeController;