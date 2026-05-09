const express = require('express');
const categoryRouter = express.Router();
const categoryController= require('../controllers/categoryController.js');
const verifyToken = require('../middleware/authMiddleware.js');

categoryRouter.post('/customCategory',verifyToken,categoryController.customizeCategory)


module.exports = categoryRouter; 