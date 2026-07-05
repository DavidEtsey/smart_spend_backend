const prisma = require("./prisma.js");

const transactionDashboard = async (userId) => {

  const incomeTotal = await prisma.income.aggregate({
    where: { user_id: userId },
    _sum: {
      amount: true
    }
  });

  const expenseTotal = await prisma.expense.aggregate({
    where: { user_id: userId },
    _sum: {
      amount: true
    }
  });

  const recentIncome = await prisma.income.findMany({
    where: { user_id: userId },
    orderBy: {
      received_at: "desc"
    },
    take: 5
  });

  const recentExpenses = await prisma.expense.findMany({
    where: { user_id: userId },
    include: {
      category: true
    },
    orderBy: {
      created_at: "desc"
    },
    take: 10
  });

  return {
    incomeTotal,
    expenseTotal,
    recentIncome,
    recentExpenses
  };
};


const getAnalytics = async (userId) => {

  const categoryBreakdown =
    await prisma.expense.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId
      },
      _sum: {
        amount: true
      }
    });

  const categories =
    await prisma.categories.findMany();

  const expenseOverview =
    categoryBreakdown.map(item => {

      const category =
        categories.find(
          c => c.category_id === item.category_id
        );

      return {
        category: category?.name,
        amount: Number(item._sum.amount)
      };
    });

  return expenseOverview;
};


const monthlyAnalytics = async (userId) => {

  const result = [];

  for(let month = 0; month < 12; month++){

    const start =
      new Date(2026, month, 1);

    const end =
      new Date(2026, month + 1, 1);

    const income =
      await prisma.income.aggregate({
        where: {
          user_id: userId,
          received_at: {
            gte: start,
            lt: end
          }
        },
        _sum: {
          amount: true
        }
      });

    const expense =
      await prisma.expense.aggregate({
        where: {
          user_id: userId,
          created_at: {
            gte: start,
            lt: end
          }
        },
        _sum: {
          amount: true
        }
      });

    result.push({
      month: start.toLocaleString("default", {
        month: "short"
      }),
      income:
        Number(income._sum.amount || 0),
      expense:
        Number(expense._sum.amount || 0)
    });
  }

  return result;
};


const getCategoryStats = async (userId) => {

  const stats =
    await prisma.expense.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId
      },
      _sum: {
        amount: true
      },
      _count: {
        expense_id: true
      }
    });

  const categories =
    await prisma.categories.findMany();

  const totalExpense =
    stats.reduce(
      (sum,item)=>
      sum + Number(item._sum.amount),
      0
    );

  return stats.map(item => {

    const category =
      categories.find(
        c=>c.category_id===item.category_id
      );

    const amount =
      Number(item._sum.amount);

    return {
      category_id: item.category_id,
      category_name: category?.name,
      icon: category?.icon,
      totalAmount: amount,
      transactionCount:
        item._count.expense_id,
      percentage:
        ((amount/totalExpense)*100)
          .toFixed(1) + '%'
    };
  });
};


module.exports = {
  transactionDashboard,
  getAnalytics,
  monthlyAnalytics,
  getCategoryStats
};