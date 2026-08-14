const express = require('express');
const categoryRouter = express.Router();
const categoryController= require('../controllers/categoryController.js');
const verifyToken = require('../middleware/authMiddleware.js');

//Route to get categories based on type
categoryRouter.get('/view', verifyToken, categoryController.getCategories);

//Route to customize categories
categoryRouter.post('/customize', verifyToken, categoryController.customizeCategory);


module.exports = categoryRouter; 