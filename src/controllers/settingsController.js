const reportService = require('../services/report.js');
const verifyToken = require('../middleware/authMiddleware.js');
const AppError = require('../utils/AppError.js');

const settingsController = {
    async exportExcel(req, res,next) {
        try {
            const { user_id } = req.user;
            const {period} = req.body;
            const validPeriods = [
                "THIS_MONTH",
                "LAST_MONTH",
                "THIS_YEAR",
                "LAST_YEAR",
                "ALL_TRANSACTIONS"
            ];

            if (!validPeriods.includes(period)) {
                throw new AppError("Invalid period", 400);
            }

            const result = await reportService.generateExcel(user_id, period);

            return res.status(200).json({
                success:true,
                message:"Excel report sent successfully.Check mail for report"
            })
        } catch (error) {
            console.error("Export transaction error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to export transactions"
            });
        }
    }
}

module.exports = settingsController;