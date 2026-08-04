const prisma = require('./prisma.js');
const { checkBudgetAndGenerateAlert } = require('../utils/budgetAlert.js');

// CREATE EXPENSE
const createExpense = async ({ user_id, amount, category_id, account_id, description, currency }) => {
  const expData = await prisma.expense.create({
    data: {
      user_id,
      amount,
      category_id,
      account_id,
      description,
      currency: currency || "GHS"
    }
  });

  // Check budget and generate alert
  const alert = await checkBudgetAndGenerateAlert(expData);

  return { ...expData, alert };
};

// GET BY USER
const getExpensesByUser = async (user_id) => {
  return await prisma.expense.findMany({
    where: { user_id },
    select: {
      expense_id: true,
      amount: true,
      category_id: true,
      account_id: true,
      description: true,
      currency: true,
      created_at: true
    },
    orderBy: { created_at: "desc" }
  });
};

// UPDATE EXPENSE
const updateExpense = async (expense_id, user_id, updates) => {
  // Verify ownership before updating
  const expense = await prisma.expense.findUnique({
    where: { expense_id: parseInt(expense_id) }
  });

  if (!expense || expense.user_id !== user_id) {
    return null;
  }

  const updated = await prisma.expense.update({
    where: { expense_id: parseInt(expense_id) },
    data: updates
  });

  // Check budget and generate alert
  const alert = await checkBudgetAndGenerateAlert(updated);

  return { ...updated, alert };
};

// DELETE EXPENSE
const deleteExpense = async (expense_id, user_id) => {
  // Verify ownership before deleting
  const expense = await prisma.expense.findUnique({
    where: { expense_id: parseInt(expense_id) }
  });

  if (!expense || expense.user_id !== user_id) {
    return null;
  }

  return await prisma.expense.delete({
    where: { expense_id: parseInt(expense_id) }
  });
};

// GET ALL EXPENSES
const getAllExpenses = async () => {
  return await prisma.expense.findMany({
    orderBy: { created_at: "desc" }
  });
};

module.exports = {
  createExpense,
  getExpensesByUser,
  updateExpense,
  deleteExpense,
  getAllExpenses
};