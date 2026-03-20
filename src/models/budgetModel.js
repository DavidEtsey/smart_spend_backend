const prisma = require('./prisma.js');

const createBudget = async ({ user_id, category, amount_limit, period, start_date, end_date }) => {

  const result = await prisma.budget.create({
      data: {
        category,
        amount_limit,
        period, 
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        user: {
          connect: { user_id }
        }
      }
  });
  return result;
};

const getBudgetsWithSpent = async(user_id) => {
  
  const budgets = await prisma.budget.findMany({
    where: {user_id},
  });

  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where: { user_id },
    _sum: {
        amount: true
    }
  });

  // Combine them by category
  const combined = budgets.map(budget => {
    // Find matching expense for the budget category
    const expenseData = expenses.find(e => e.category === budget.category);

    return {
      id: budget.id,
      category: budget.category,
      amount_limit: budget.amount_limit,
      spent: expenseData?._sum?.amount || 0, // total spent in this category
    };
  });
  return combined;
};

const updateBudget = async (budget_id, user_id, updates ) => {

  const budget = await prisma.budget.findFirst({
    where: { budget_id: Number(budget_id), user_id }
  });

  if (!budget) return null;

  return prisma.budget.update({
    where: { budget_id: Number(budget_id) },
    data: updates
  });
  
};

const deleteBudget = async (budget_id, user_id) => {
  const budget = await prisma.budget.findFirst({
    where: { budget_id: Number(budget_id), user_id }
  });

  if (!budget) return null;

  return prisma.budget.delete({
    where: { budget_id: Number(budget_id) }
} );

};



module.exports = {
  createBudget,
  getBudgetsWithSpent,
  updateBudget,
  deleteBudget,
};