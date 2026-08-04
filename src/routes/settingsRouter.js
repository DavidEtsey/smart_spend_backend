const express = require('express');
const settingsRouter = express.Router();
const verifyToken = require('../middleware/authMiddleware.js');
const settingsController = require('../controllers/settingsController.js');

settingsRouter.post('/reports/export-excel',verifyToken, settingsController.exportExcel);

module.exports = settingsRouter;