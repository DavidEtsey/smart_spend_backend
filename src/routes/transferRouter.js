const express = require('express');
const transferRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const  transferController = require('../controllers/transferController.js');

transferRouter.use(verifyToken);

transferRouter.post('/add', transferController.createTransfer);

module.exports = transferRouter;