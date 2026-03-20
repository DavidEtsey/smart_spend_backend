const express = require('express');
const incomeRouter = express.Router();
const incomeController = require('../controllers/incomeController.js');
const verifyToken = require('../middleware/authMiddleware.js');


incomeRouter.post('/addIncome',verifyToken, incomeController.addIncome);
incomeRouter.get('/readIncome', verifyToken, incomeController.getIncome );
incomeRouter.put('/updateIncome/:income_id', verifyToken, incomeController.updateIncome);
incomeRouter.delete('/deleteIncome/:income_id', verifyToken, incomeController.deleteIncome);

module.exports = incomeRouter; 