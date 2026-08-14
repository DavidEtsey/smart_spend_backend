const express = require('express');
const accountRouter = express.Router();
const accountController= require('../controllers/accountController.js');
const verifyToken = require('../middleware/authMiddleware.js');

//Route to get accounts based on type
accountRouter.get('/view', verifyToken, accountController.getAccounts);

//Route to customize accounts
accountRouter.post('/customize', verifyToken, accountController.customizeAccount);


module.exports = accountRouter; 