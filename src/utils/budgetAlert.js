const prisma = require('../models/prisma'); // adjust path if needed

const checkBudgetAndGenerateAlert = async ({user_id, category, created_at}) => {
  // Find matching budget
  const budget = await prisma.budget.findFirst({
    where: {
      user_id,
      category,
      start_date: { lte: new Date(created_at) },// lte meaning <= indicates  budget's starting date should be <= expense's created_at date
      end_date: { gte: new Date(created_at) }
    }
  });

  // No 
  if (!budget) return null;

  // Get all expenses in this budget range
  const expenses = await prisma.expense.aggregate({
    where: {
      user_id,
      created_at: {
        gte: budget.start_date,
        lte: budget.end_date
      }
    },
    select: { amount: true }
  });

  // Calculate total spent
  const spent = Number(result._sum.amount || 0);

  // Compute percentage
  const percentage = budget.amount_limit > 0 ? (spent / budget.amount_limit) * 100 : 0;

  const remaining = budget.amount_limit - spent;

  // Generate alert
  if (percentage >= 100) {
    return {
      status: 'danger',
      spent,
      limit: budget.amount_limit,
      percentage: Number(percentage.toFixed(2)) + "%",
      remaining,
      message: `🚨 You exceeded your ${category} budget by ${spent - budget.amount_limit}`
    };
  }

  if (percentage >= 80) {
    return {
      status: 'warning',
      spent,
      limit: budget.amount_limit,
      percentage: Number(percentage.toFixed(2)) + "%",
      remaining,
      message: `⚠️ You have used ${percentage.toFixed(0)}% of your ${category} budget`
    };
  }

  // Safe
  return null;
};

module.exports = { checkBudgetAndGenerateAlert };