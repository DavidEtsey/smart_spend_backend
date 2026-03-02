const db = require('../config/db');

const createBudget = async ({ user_id, category, amount_limit, period, start_date, end_date }) => {


  const result = await db.query(
    `INSERT INTO budgets (user_id, category, amount_limit, period,start_date, end_date)
     VALUES ($1, $2, $3, $4, $5 ,$6)
     RETURNING *`,
    [user_id, category, amount_limit, period || 'monthly',start_date, end_date]
  );
  return result.rows[0];
};

const getBudgetsWithSpent = async(user_id) => {
  const result = await db.query(
    `SELECT 
      b.budget_id,
      b.category,
      b.amount_limit::float AS amount_limit,
      b.period,
      b.start_date,
      b.end_date,
      COALESCE(SUM(e.amount), 0)::float AS spent
    FROM budgets b
    LEFT JOIN expenses e
      ON b.user_id = e.user_id
      AND b.category = e.category
      AND e.created_at >= b.start_date
      AND e.created_at < b.end_date + INTERVAL '1 day'
    WHERE b.user_id = $1
    GROUP BY 
      b.budget_id,
      b.category,
      b.amount_limit,
      b.period,
      b.start_date,
      b.end_date
    ORDER BY b.start_date DESC;
    `,
    [user_id]
  );
  return result.rows;

};

const updateBudget = async (budget_id, user_id, updates ) => {

  const keys = Object.keys(updates);      // ['period','category']  
  const values = Object.values(updates);  // [weekly,'Food']
  
  const setClause = keys
  .map((k, i) => `${k}=$${i + 1}`)
  .join(', '); // "amount=$1, category=$2"
  
  const query=
    `UPDATE budgets
     SET ${setClause}
     WHERE budget_id=$${keys.length + 1} AND user_id=$${keys.length + 2}
     RETURNING *`;


  const result = await db.query(query,[
    ...values,
    budget_id,
    user_id]
  );

  return result.rows[0];
};

const deleteBudget = async (budget_id, user_id) => {
  const result = await db.query(
    `
    DELETE FROM budgets
    WHERE budget_id=$1 AND user_id=$2
    RETURNING *
    `,
    [budget_id, user_id]
  );

  return result.rows[0];
};



module.exports = {
  createBudget,
  getBudgetsWithSpent,
  updateBudget,
  deleteBudget,
};