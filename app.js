const express = require('express');
const app = express();
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = require('./src/config/db.js');
const cors = require('cors');
const logger = require("./src/middleware/loggerMiddleware.js");
const authRouter=require('./src/routes/authRouter.js');
const expenseRouter=require('./src/routes/expenseRouter.js');
const budgetRouter = require('./src/routes/budgetRouter.js');
const incomeRouter = require('./src/routes/incomeRouter.js');
const categoryRouter = require('./src/routes/categoryRouter.js');
const accountRouter = require('./src/routes/accountRouter.js');
const dashboardRouter = require('./src/routes/dashboardRouter.js');
const settingsRouter = require('./src/routes/settingsRouter.js');
const transferRouter = require('./src/routes/transferRouter.js')

const { apiLimiter } = require('./src/middleware/rateLimiter.js');

// Apply general API rate limiter to all requests
app.use(apiLimiter);

app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(logger);

//Routes imported
app.use('/api/auth/user',authRouter);
app.use('/api/expenses',expenseRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/income', incomeRouter);
app.use('/api/category', categoryRouter);
app.use('/api/account', accountRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/transfer',transferRouter)

// Global error handler (MUST be last middleware)
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  });

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
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
