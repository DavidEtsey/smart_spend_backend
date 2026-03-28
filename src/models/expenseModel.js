const { use } = require('react');
const prisma = require('./prisma.js');

// CREATE
const createExpense = async (expense) => {

  const { user_id, amount, description, category } = expense;
  
  return await prisma.expense.create({
    data: {
      user_id,
      amount,
      description,
      category
    }
  });
};

// GET BY USER
const getExpensesByUser = async (user_id) => {
  
  return await prisma.expense.findMany({
    where: { user_id:Number(user_id) },
    orderBy: {
      category: 'desc'
    }
  });
};

//UPDATE
const updateExpense = async (expense_id, user_id, updates) => {
  await prisma.expense.updateMany({
    where: { expense_id, user_id },
    data: updates
  });

  return await prisma.expense.findFirst({
    where: { expense_id, user_id }
  });
};

//DEL 
const deleteExpense = async (expense_id, user_id) => {
  const existing = await prisma.expense.findFirst({
    where: { expense_id, user_id }
  });

  if (!existing) return null;

  await prisma.expense.delete({
    where: { expense_id }
  });

  return existing;
};

// GET ALL
const getAllExpenses = async () => {
  return await prisma.expense.findMany({
    orderBy: {
      category: 'desc'
    }
  });
};

module.exports = {
  createExpense,
  getExpensesByUser,
  updateExpense,
  deleteExpense,
  getAllExpenses
};