const prisma = require('./prisma.js');
const {checkBudgetAndGenerateAlert} = require('../utils/budgetAlert.js');

// CREATE
const createExpense = async (expense) => {

  const { user_id, amount, description, category } = expense;
  
  const expData= await prisma.expense.create({
    data: {
      user_id,
      amount,
      description,
      category
    },
    select:{
      user_id: true,
      category: true,
      created_at:true
    }
  });

  // Check budget and generate alert
  const generateAlert= await checkBudgetAndGenerateAlert(expData);

 return { ...expData, alert: generateAlert };
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
    where: { expense_id: Number(expense_id), user_id },
    data: updates
  });

  
  const data= await prisma.expense.findFirst({
    where: { expense_id: Number(expense_id), user_id }
  });

  const generateAlert= await checkBudgetAndGenerateAlert({
    user_id:data.user_id,
    category:data.category,
    created_at:data.created_at
  });


  return {data, alert: generateAlert}
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