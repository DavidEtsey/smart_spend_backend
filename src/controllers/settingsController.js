const reportService = require('../services/report.js');
const verifyToken = require('../middleware/authMiddleware.js');
const AppError = require('../utils/AppError.js');

const settingsController = {
    async exportExcel(req, res,next) {
        try {
            const { user_id } = req.user;
            const { period,startDate, endDate,recipientEmail } = req.body;

            if (!startDate || !endDate || !recipientEmail) {
                return res.status(400).json({
                    success:false,
                    message:"Missing required fields"
                });
            }

            const result = await reportService.generateReport(user_id,period,startDate,endDate,recipientEmail);

            return res.status(200).json({
                success:true,
                message:"Excel report sent successfully"
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = settingsController;