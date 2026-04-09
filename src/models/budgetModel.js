const prisma = require('./prisma.js');
const { addMonths, diffInMonths } = require('../utils/dateCalc.js');

  
const normalizeBudgetInput = ( start_date, end_date, period ) => {
  // Convert to Date objects immediately
  let start = start_date ? new Date(start_date) : null;
  let end = end_date ? new Date(end_date) : null;
    
  // Case 1: start + period → compute end_date

  if (start && period && !end) {
    end = addMonths(start, period);
  }
  // Case 2: start + end → compute period
  if (start && end && !period) {
    period = diffInMonths(start, end);
  }

  // Case 3: all provided → validate
  if (start && end && period) {
    const calculated = diffInMonths(start, end);

    if (calculated !== period) {
      // Option A: Trust period → recompute end
      end = addMonths(start, period);
    }
  }

  return {start_date:start, end_date:end, period };
};


const createBudget = async ({ user_id, category, amount_limit, period, start_date, end_date }) => {

  const normalized = normalizeBudgetInput(start_date, end_date, period );

  const result = await prisma.budget.create({
    data: {
      category,
      amount_limit,
      start_date: normalized.start_date,
      end_date: normalized.end_date,
      period: normalized.period,
      user: {
        connect: { user_id }
      }
    },
    select:{
      category:true,
      amount_limit:true,
      start_date:true ,
      end_date: true,
      period: true,
      created_at:false}
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

  // Merges old from budget table and new data from user updates
  const merged = {
    start_date: updates.start_date ?? budget.start_date,
    end_date: updates.end_date ?? budget.end_date,
    period: updates.period ?? budget.period,
  };

  // Normalize (recalculate intelligently)
  const normalized = normalizeBudgetInput(
    merged.start_date,
    merged.end_date,
    merged.period
  );

  // Final update payload
  const finalData = {
    category: updates.category ?? budget.category,
    amount_limit: updates.amount_limit ?? budget.amount_limit,
    start_date: normalized.start_date,
    end_date: normalized.end_date,
    period: normalized.period,
  };


  return prisma.budget.update({
    where: { budget_id: Number(budget_id) },
    data: finalData
  });
  
};


const deleteBudget = async (budget_id, user_id) => {
  
  const budget = await prisma.budget.findFirst({
    where: { budget_id: Number(budget_id), user_id }
  });

  if (!budget) return null;

  return prisma.budget.delete({
    where: { budget_id: Number(budget_id) }
  });

};

module.exports = {
  createBudget,
  getBudgetsWithSpent,
  updateBudget,
  deleteBudget,
};