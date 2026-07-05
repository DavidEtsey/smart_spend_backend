const express = require('express');
const dashboardRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const  {transactionDashboard,analyticsDashboard,categoryDashboard} = require('../controllers/dashboardController.js');

dashboardRouter.use(verifyToken);

dashboardRouter.get('/transactions', transactionDashboard);
dashboardRouter.get('/analytics', analyticsDashboard);
dashboardRouter.get('/categories',categoryDashboard);


module.exports = dashboardRouter;