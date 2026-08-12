const prisma = require("./prisma");
const { getDateRange } = require("../services/dateRangeService");

exports.getTransactionsByDate = async (user_id, period) => {
    const { startDate, endDate } = getDateRange(period);

    const [incomeData, expenseData] = await Promise.all([
        prisma.income.findMany({
            where: {
                user_id,
                received_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                category: true,
                account: true,
                user: {
                    select: {
                        email: true,
                    }
                }
            },
            orderBy: {
                received_at: "asc"
            }
        }),
        prisma.expense.findMany({
            where: {
                user_id,
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                category: true,
                account: true,
                user: {
                    select: {
                        email: true,
                    }
                }
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
            currency: item.currency,
            email: item.user.email,
        })),
        ...expenseData.map((item) => ({
            transaction_id: item.expense_id,
            type: "expense",
            amount: Number(item.amount),
            description: item.description,
            date: item.created_at,
            category: item.category ? item.category.name : null,
            account: item.account ? item.account.name : null,
            currency: item.currency,
            email: item.user.email
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    return transactions;
};