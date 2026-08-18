const express = require('express');
const transferRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const  transferController = require('../controllers/transferController.js');

transferRouter.post('/add',verifyToken, transferController.createTransfer);

module.exports = transferRouter;