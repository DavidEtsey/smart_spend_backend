const reportModel = require("../models/settingsModel.js");
const excelService = require("../services/excel.js");
const emailService = require("../services/sendEmail.js");
const { getDateRange } = require("../services/dateRangeService");
const AppError = require("../utils/AppError.js");


exports.generateExcel = async(user_id,period)=>{
    const {label}= getDateRange(period);

    // Get transactions
    const transactions =await reportModel.getTransactionsByDate(user_id, period);

    if(transactions.length === 0){
        throw new AppError(
            "No transactions found for this period",
            404
        );
    }

    // Generate Excel
    const filePath = await excelService.createExcel(transactions, period);

    const email = transactions[0].email;
    if (!email) {
        throw new AppError("No email found for report recipient", 400);
    }
    // Send email
    await emailService.sendReportEmail(email, label, filePath);
    return true;
};

exports.generateLastMonth = async(user_id,period,startDate,endDate)=>{
    // Get transactions
    const transactions =await reportModel.getTransactionsByDate(user_id,startDate,endDate); 
    
    if(transactions.length === 0){
        throw new AppError(
            "No transactions found for this period",
            404
        );
    }

    // Generate Excel
    const filePath = await excelService.createExcel(transactions, period);

    const email = transactions[0].email;
    if (!email) {
        throw new AppError("No email found for report recipient", 400);
    }

    try{
        // Send email
        await emailService.sendReportEmail(email, period, filePath);

        // Email successfully sent → delete Excel file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Temporary Excel report deleted.");
        }
    }catch (error) {
        // Keep the file if email failed
        console.error("Failed to send report email:", error);
        throw error;
    }
    return true;
};