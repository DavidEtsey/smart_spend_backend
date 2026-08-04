const express = require('express');
const transactionRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const  transactionController = require('../controllers/transactionController.js');

transactionRouter.get('/',verifyToken, transactionController.getDailyTransactions);
transactionRouter.get('/monthly/:year?/:month?',verifyToken, transactionController.getMonthlyTransactions);


module.exports = transactionRouter;