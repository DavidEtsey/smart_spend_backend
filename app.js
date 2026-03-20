const express = require('express');
const app = express();
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = require('./src/config/db.js');
const cors = require('cors');
const authRouter=require('./src/routes/authRouter.js');
const expenseRouter=require('./src/routes/expenseRouter.js');
const budgetRouter = require('./src/routes/budgetRouter.js');
const incomeRouter = require('./src/routes/incomeRouter.js');

const { apiLimiter } = require('./src/middleware/rateLimiter.js');

// Apply general API rate limiter to all requests
app.use(apiLimiter);

app.use(cors());

// Middleware to parse JSON
app.use(express.json());

//Routes imported
app.use('/api/user',authRouter);
app.use('/api/expenses',expenseRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/income', incomeRouter);

app.use((err, req, res, next) => {
  console.error(err);
  // You will see an OH NO! in the page, with a status code of 500 that can be seen in the network tab of the dev tools
  res.status(500).send(err.message);
});

pool.query("SELECT 1")
    .then(() => {
        console.log("✅ Database connected successfully");
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });

    
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
  // This is important!
  // Without this, any startup errors will silently fail
  // instead of giving you a helpful error message.
  if(error){
    throw error
  }
},
console.log(`Server running on http://localhost:${PORT}`)
);
