const prisma = require("./prisma.js");

const transactionDashboard = async (user_id, month, year) => {

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const incomeTotal = await prisma.income.aggregate({
    where: { user_id, 
    received_at: { gte: startDate, lt: endDate } },
    _sum: {
      amount: true
    }
  });

  const expenseTotal = await prisma.expense.aggregate({
    where: { user_id, 
    created_at: { gte: startDate, lt: endDate } },
    _sum: {
      amount: true
    }
  });

  const income =Number(incomeTotal._sum.amount || 0);
  const expense =Number(expenseTotal._sum.amount || 0);
  const balance = income - expense;
  const savings = balance || 0;

  // Get incomes
  const incomes = await prisma.income.findMany({
    where: {
      user_id,
      received_at: {
        gte: startDate,
        lt: endDate
      }
    },include: {
      category: {select: { icon: true,name:true }}
    }
  });

  // Get expenses
  const expenses = await prisma.expense.findMany({
    where: {
      user_id,
      created_at: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
        category: {select: { icon: true,name:true }}
      }
  });

  const today = new Date();
  const todayString = today.toDateString();

  // Merge transactions
  const transactions = [
    ...incomes.map((i) => {
      const receivedAt = new Date(i.received_at);
      return {
        type: "income",
        title: i.source,
        amount: i.amount,
        icon: i.category?.icon,
        category: i.category?.name,
        account: i.account,
        description: i.description,
        time: receivedAt.toISOString().split("T")[0],
        displayDate: receivedAt.toDateString() === todayString ? "Today" : receivedAt.toDateString(),
        sortDate: receivedAt
      };
    }),
    ...expenses.map((e) => {
      const createdAt = new Date(e.created_at);
      return {
        type: "expense",
        title: e.category?.name,
        amount: e.amount,
        icon: e.category?.icon,
        category: e.category?.name,
        account: e.account,
        description: e.description,
        time: createdAt.toISOString().split("T")[0],
        displayDate: createdAt.toDateString() === todayString ? "Today" : createdAt.toDateString(),
        sortDate: createdAt
      };
    })
  ];

  // Sort latest first
  transactions.sort((a, b) => b.sortDate - a.sortDate);

  // Group by day
  const grouped = {};

  transactions.forEach((t) => {
    const day = t.sortDate.toDateString() === todayString ? "Today" : t.sortDate.toDateString();

    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(t);
  });
  
  return {
    incomeTotal,
    expenseTotal,
    balance,
    savings,
    transactions: grouped,
  };
};


const getPieChart = async (user_id) => {

  const expenses=
    await prisma.expense.groupBy({
      by: ["category_id"],
      where: {
        user_id
      },
      _sum: {
        amount: true
      }
    });
  
  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item._sum.amount),
    0
  );
  const categoryIds = expenses.map((item) => item.category_id);

  const categories = await prisma.category.findMany({
    where: {
      category_id: {
        in: categoryIds
      }
    }
  });

  const formatted = expenses.map((expense) => {
    const category = categories.find(
      (cat) => cat.category_id === expense.category_id
    );

    const amount = Number(expense._sum.amount);
    const percentage = ((amount / totalExpense) * 100).toFixed(1);

    return {
      category: category.name,
      amount,
      percentage: percentage + "%"
    };
  });
  
  return formatted;
};


const getBarChart = async (user_id) => {

  const income = await prisma.income.findMany({
    where: {
      user_id: user_id
    }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      user_id: user_id
    }
  });

  const monthlyData = {};

  income.forEach((item) => {
    const month = new Date(item.received_at).toLocaleString("default", {
      month: "short"
    });

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        income: 0,
        expense: 0
      };
    }

    monthlyData[month].income += Number(item.amount);
  });

  expenses.forEach((item) => {
    const month = new Date(item.created_at).toLocaleString("default", {
      month: "short"
    });

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        income: 0,
        expense: 0
      };
    }

    monthlyData[month].expense += Number(item.amount);
  });

  return Object.values(monthlyData);

};


const getCategoryStats = async (user_id) => {
  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { user_id: null },       // Global categories
        { user_id }              // User categories
      ]
    },
    orderBy: {
      name: "asc"
    }
  });

  const results = [];

  for (const category of categories) {
    // Expenses belonging to this category
    const expenses = await prisma.expense.findMany({
      where: {
        user_id,
        category_id: category.category_id
      }
    });

    const expenseAmount = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    // Income whose source matches category name
    const incomes = await prisma.income.findMany({
      where: {
        user_id,
        category_id: category.category_id
      }
    });

    const incomeAmount = incomes.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const transactionCount =
      expenses.length + incomes.length;

    const totalAmount =
      expenseAmount + incomeAmount;

    // Don't return empty categories
    if (transactionCount > 0) {
      results.push({
        category_id: category.category_id,
        name: category.name,
        icon: category.icon,
        transactions: transactionCount,
        totalAmount
      });
    }
  }

  // Largest amount first
  results.sort((a, b) => b.totalAmount - a.totalAmount);

  return results;
};


module.exports = {
  transactionDashboard,
  getPieChart,
  getBarChart,
  getCategoryStats
};