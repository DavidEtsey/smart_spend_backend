const express = require('express');
const budgetRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

budgetRouter.use(authMiddleware);

budgetRouter.post('/create', budgetController.createBudget);
budgetRouter.get('/read', budgetController.getBudget);
budgetRouter.post('/update/:budget_id', budgetController.updateBudget);
budgetRouter.delete('/delete/:budget_id', budgetController.deleteBudget);

module.exports = budgetRouter;