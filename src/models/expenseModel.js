const db = require('../config/db');

const createExpense = async (expense) => {
  const { user_id, amount, description, category } = expense;

  const result = await db.query(
    `INSERT INTO expenses (user_id, amount, description,category)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, amount, description, category]
  );

  return result.rows[0];
};

const getExpensesByUser = async (user_id) => {
  const result = await db.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY category DESC',
    [user_id]
  );

  return result.rows;
};

const updateExpense = async (expense_id, user_id, updates) => {
  
  const keys = Object.keys(updates);      // ['amount','category']  
  const values = Object.values(updates);  // [100,'Food']
  
  const setClause = keys
  .map((k, i) => `${k}=$${i + 1}`)
  .join(', '); // "amount=$1, category=$2"
  
  const query=
    `UPDATE expenses
     SET ${setClause}
     WHERE expense_id=$${keys.length + 1} AND user_id=$${keys.length + 2}
     RETURNING *`;

  const result = await db.query(query, [
    ...values,
    expense_id,
    user_id]);

  return result.rows[0];
};

const deleteExpense = async (expense_id, user_id) => {
  const result = await db.query(
    'DELETE FROM expenses WHERE expense_id=$1 AND user_id=$2 RETURNING *',
    [expense_id, user_id]
  );

  return result.rows[0];
};

const getAllExpenses = async () => {
    const result = await db.query('SELECT * FROM expenses ORDER BY category DESC'); 
    return result.rows;
};

module.exports = {
  createExpense,
  getExpensesByUser,
  updateExpense,
  deleteExpense,
  getAllExpenses
};
