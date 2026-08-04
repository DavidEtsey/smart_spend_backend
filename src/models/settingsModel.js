const prisma = require("./prisma");

exports.getTransactionsByDate = async (user_id, startDate, endDate) => {

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Include the entire end date
    end.setHours(23, 59, 59, 999);

    const [incomeData, expenseData] = await Promise.all([
        prisma.income.findMany({
            where: {
                user_id,
                received_at: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                category: true,
                account: true
            },
            orderBy: {
                received_at: "asc"
            }
        }),
        prisma.expense.findMany({
            where: {
                user_id,
                created_at: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                category: true,
                account: true
            },
            orderBy: {
                created_at: "asc"
            }
        })
    ]);

    const transactions = [
        ...incomeData.map((item) => ({
            transaction_id: item.income_id,
            type: "income",
            amount: Number(item.amount),
            description: item.description,
            date: item.received_at,
            category: item.category ? item.category.name : null,
            account: item.account ? item.account.name : null,
            currency: item.currency
        })),
        ...expenseData.map((item) => ({
            transaction_id: item.expense_id,
            type: "expense",
            amount: Number(item.amount),
            description: item.description,
            date: item.created_at,
            category: item.category ? item.category.name : null,
            account: item.account ? item.account.name : null,
            currency: item.currency
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    return transactions;
};