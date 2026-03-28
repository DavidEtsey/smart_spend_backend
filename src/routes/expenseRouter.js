const express = require('express');
const expenseRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const expenseController = require('../controllers/expenseController.js');
const {getAllExpenses} = require('../controllers/expenseController.js');

expenseRouter.use(authMiddleware);

expenseRouter.post('/create', expenseController.createExpense);
expenseRouter.get('/read', expenseController.getExpensesByUser);
expenseRouter.post('/update/:expense_id', expenseController.updateExpense);
expenseRouter.delete('/delete/:expense_id', expenseController.deleteExpense);

expenseRouter.get('/read_all', getAllExpenses);

module.exports = expenseRouter;