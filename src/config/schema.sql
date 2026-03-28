/*
const extensionQuery = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
`;*/

const userTable = `
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY ,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const expenseTable = `
CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY ,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const budgetTable=`
CREATE TABLE IF NOT EXISTS budgets (
    budget_id SERIAL PRIMARY KEY ,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount_limit NUMERIC(10,2) NOT NULL,
    period INTEGER CHECK (period > 0), -- duration in months
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const incomeTable=`
CREATE TABLE IF NOT EXISTS income (
    income_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    source VARCHAR(50), -- salary, gift, business etc
    method VARCHAR(50), -- cash, mobile_money, bank_transfer
    description TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

module.exports = {
    userTable,
    expenseTable,
    budgetTable,
    incomeTable
};  