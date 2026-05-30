const prisma = require("./prisma.js");

const transactionModel = {
    async getTransactions(user_id, startDate,endDate, type) {

        //INCOME
        const incomeData = type !== "expense"?
        await prisma.income.findMany({
            where: {
                user_id,   
                received_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                received_at: "asc"
            }
        })
        : [];

        //EXPENSE
        const expenseData = type !== "income"?
        await prisma.expense.findMany({
            where: {
            user_id,
            created_at: {
                gte: startDate,
                lte: endDate
            }
            },
            include: {
            category: true
            },
            orderBy: {
            created_at: "asc"
            }
        })
        : [];

        //FORMAT INCOME
        const formattedIncome = incomeData.map((item) => ({
            transaction_id: item.income_id,
            type: "income",
            amount: Number(item.amount),
            source: item.source,
            description: item.description,
            time: item.received_at
        }));

        //FORMAT EXPENSE
        const formattedExpense = expenseData.map((item) => ({
            transaction_id: item.expense_id,
            type: "expense",
            amount: Number(item.amount),
            category: item.category ? item.category.name : null,
            description: item.description,
            time: item.created_at
        }));

        //MERGE TRANSACTIONS
        const allTransactions = [...formattedIncome, ...formattedExpense];

        //SORT BY TIME
        const transactions = allTransactions.sort(
            (a, b) => new Date(a.time) - new Date(b.time)
        );

        //TOTALS
        const totalIncome = formattedIncome.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const totalExpense = formattedExpense.reduce(
            (sum, item) => sum + item.amount,
            0
        );

       //OVERALL TOTAL income adds expense subtracts
       const overallTotal = totalIncome - totalExpense;

       return {
            //date,
            totalIncome,
            totalExpense,
            overallTotal,
            transactions
        };

    },

    async getMonthlyTransactions(user_id, startDate,endDate, type) {
        
        //INCOME
        const incomeData =type !== "expense"?
        await prisma.income.findMany({
            where: {
                user_id,
                received_at: {
                gte: startDate,
                lte: endDate
                }
            },
            orderBy: {
                received_at: "desc"
            }
            })
        : [];
    }
}

module.exports = transactionModel;