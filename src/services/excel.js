const ExcelJS = require("exceljs");
const path = require("path");

exports.createExcel = async(transactions,period)=>{
    const workbook =new ExcelJS.Workbook();
    const worksheet =workbook.addWorksheet("Transactions");

    worksheet.columns=[
        {
            header:"Date",
            key:"date",
            width:20
        },

        {
            header:"Type",
            key:"type",
            width:15
        },

        {
            header:"Category",
            key:"category",
            width:20
        },

        {
            header:"Description",
            key:"description",
            width:30
        },

        {
            header:"Amount",
            key:"amount",
            width:15
        },

        {
            header:"Account",
            key:"account",
            width:20
        }
    ];

    transactions.forEach(transaction=>{
        worksheet.addRow({
            date:transaction.date.toISOString().split("T")[0],
            type:transaction.type,
            category:transaction.category || "N/A",
            description:transaction.description,
            amount:transaction.amount,
            account:transaction.account || "N/A"
        });
    });

    const fileName =`SmartSpend-Excel-${period}.xlsx`;

    const filePath =
    path.join(
        __dirname,
        "../reports",
        fileName
    );

    await workbook.xlsx.writeFile(
        filePath
    );

    return filePath;
};