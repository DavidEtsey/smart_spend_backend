const ExcelJS = require("exceljs");
const path = require("path");

exports.createExcel = async (transactions, period) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Type", key: "type", width: 15 },
        { header: "Category", key: "category", width: 20 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Currency", key: "currency", width: 12 },
        { header: "Account", key: "account", width: 20 },
        { header: "Description", key: "description", width: 40 },
    ];

    const title = `SmartSpend ${period.replace(/_/g, ' ')} Report`;
    worksheet.insertRow(1, [title]);
    worksheet.mergeCells("A1:G1");
    const titleRow = worksheet.getRow(1);
    titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF0F766E" } };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    titleRow.height = 28;

    transactions.forEach(transaction => {
        worksheet.addRow({
            date: transaction.date.toISOString().split("T")[0],
            type: transaction.type,
            category: transaction.category || "N/A",
            amount: transaction.amount,
            currency: transaction.currency,
            description: transaction.description,
            account: transaction.account || "N/A"
        });
    });

    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    const fileName = `SmartSpend-Excel-${period}.xlsx`;
    const filePath = path.join(__dirname, "../reports", fileName);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
};