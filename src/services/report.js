const reportModel = require("../models/settingsModel.js");
const excelService = require("../services/excel.js");
const emailService = require("../services/sendEmail.js");


exports.generateReport = async(user_id,period,startDate,endDate,recipientEmail)=>{
    // Get transactions
    const transactions =await reportModel.getTransactionsByDate(user_id,startDate,endDate);

    if(transactions.length === 0){
        throw new Error(
            "No transactions found for this period"
        );
    }

    // Generate Excel
    const filePath =await excelService.createExcel(transactions,period);

    // Send email
    await emailService.sendReportEmail(recipientEmail,period,filePath);
    return true;
};