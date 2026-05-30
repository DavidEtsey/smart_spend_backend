const transactionModel = require('../models/transactionModel.js');

const transactionController = {
    async getDailyTransactions(req, res, next) {
        try {
            // req.params
            let { date } = req.query;

            //IF NO DATE PROVIDED, USE TODAY'S DATE
            function getDate(d) {
                if (!d) {
                    const today = new Date();

                    // YYYY-MM-DD format
                    date = today.toISOString().split("T")[0];
                }
                return date;
            }

            // start of day
            const startDate = new Date(getDate(date));
            startDate.setHours(0, 0, 0, 0);

            // end of day
            const endDate = new Date(getDate(date));
            endDate.setHours(23, 59, 59, 999);

            // req.query
            const { type } = req.query;

            const { user_id} = req.user;

            const data = await transactionModel.getTransactions(
                user_id,
                startDate,
                endDate,
                type
            );

            return res.status(200).json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error in viewing daily transactions:', error);
            next(error);
        }

    },

    async getMonthlyTransactions(req, res, next) {
        try {
            const { year, month } = req.params;
            const { type } = req.query;
            const {user_id} = req.user;


            if (!year || !month) {
                //Use current month and year if not provided
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1; // 1 - 12
            }

            //VALIDATE MONTH AND YEAR
            if (month < 1 || month > 12) {
                return res.status(400).json({
                success: false,
                message:
                    "Month must be between 1 and 12"
                });
            }

            //START OF MONTH
            const startDate = new Date(
            Number(year),
            Number(month) - 1,
            1
            );

    
            //END OF MONTH
            const endDate = new Date(
            Number(year),
            Number(month),
            0,
            23,
            59,
            59,
            999
            );

            const data = await transactionModel.getMonthlyTransactions(
                user_id,
                startDate,
                endDate,
                type
            );

            return res.status(200).json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error in viewing monthly transactions:', error);
            next(error);
        }
    }
};

module.exports = transactionController;