# SmartSpend Backend Documentation

## 1. Overview

SmartSpend_Backend is a Node.js Express API for personal finance management. It supports user authentication, expense tracking, budgeting, income records, category customization, and transaction history.

**Tech Stack:**

- Node.js with Express.js
- PostgreSQL with Prisma ORM
- JWT-based authentication
- Express validators for request validation
- Rate limiting and CORS enabled

## 2. Architecture

The backend follows a layered structure:

- `app.js` — Express app setup, middleware, routers, and database connection check.
- `src/routes/` — API route definitions (6 routers).
- `src/controllers/` — Request handling and response logic.
- `src/models/` — Database access using Prisma ORM and raw SQL.
- `src/middleware/` — Authentication, logging, and rate limiting.
- `src/validations/` — Request validation rules.
- `src/utils/` — Helpers for tokens, date logic, email, and budget alerts.
- `src/config/` — PostgreSQL connection and schema utilities.
- `prisma/` — Database schema definitions and migrations.

## 3. Key Dependencies

| Dependency           | Purpose                       |
| -------------------- | ----------------------------- |
| `express`            | Web framework                 |
| `pg`                 | PostgreSQL client             |
| `prisma`             | ORM                           |
| `@prisma/client`     | Prisma client library         |
| `@prisma/adapter-pg` | PostgreSQL adapter for Prisma |
| `bcrypt`             | Password hashing              |
| `jsonwebtoken`       | JWT authentication            |
| `express-validator`  | Request validation            |
| `express-rate-limit` | API rate limiting             |
| `cors`               | CORS middleware               |
| `morgan`             | HTTP request logging          |
| `nodemailer`         | Email sending                 |
| `dotenv`             | Environment variables         |
| `uuid`               | Unique ID generation          |

## 4. Entry Point — `app.js`

- Loads environment variables from `.env`
- Configures Express middleware: CORS, JSON parser, logger, global rate limiter
- Registers 6 routers:
  - `/api/user` — Authentication and profile management
  - `/api/expenses` — Expense CRUD operations
  - `/api/budgets` — Budget management
  - `/api/income` — Income tracking
  - `/api/category` — Category management
  - `/api/transactions` — Transaction history and analytics
- Includes global error handler for uncaught exceptions
- Verifies database connectivity via `src/config/db.js`

## 5. Authentication

### JWT Authentication

- Implemented in `src/middleware/authMiddleware.js`.
- Verifies Bearer token from `Authorization` header.
- Attaches decoded token payload to `req.user`.
- Returns 401 for missing/invalid tokens.

### Auth Routes

Defined in `src/routes/authRouter.js`:

- `POST /api/user/signUp` — Register new user.
- `POST /api/user/signIn` — Login and receive JWT.
- `GET /api/user/profile` — Get basic profile.
- `GET /api/user/detailed_profile` — Get profile with aggregated stats.
- `PUT /api/user/update_profile` — Update username/email/full_name.
- `PUT /api/user/passwordChange` — Change password.
- `POST /api/user/forgotPassword` — Generate password reset code.
- `POST /api/user/resetPassword` — Reset password.

## 6. Expense Management

### Routes (`src/routes/expenseRouter.js`)

- `POST /api/expenses/create` — Add expense.
- `GET /api/expenses/read` — Get user expenses.
- `GET /api/expenses/read_all` — Get all expenses.
- `PUT /api/expenses/update/:expense_id` — Update expense.
- `DELETE /api/expenses/delete/:expense_id` — Delete expense.

### Controller / Model

- `src/controllers/expenseController.js` handles request validation and response.
- `src/models/expenseModel.js` uses Prisma for expense CRUD.
- Expense creation and update trigger budget alert checks via `src/utils/budgetAlert.js`.

## 7. Budget Management

### Routes (`src/routes/budgetRouter.js`)

- `POST /api/budgets/create` — Create budget.
- `GET /api/budgets/read` — Read budgets with spent progress.
- `PUT /api/budgets/update/:budget_id` — Update budget.
- `DELETE /api/budgets/delete/:budget_id` — Delete budget.

### Controller / Model

- `src/controllers/budgetController.js` manages request validation and budget formatting.
- `src/models/budgetModel.js` normalizes dates and periods, calculates budget spend totals, and updates budgets.
- Date math helpers live in `src/utils/dateCalc.js`.

## 8. Income Tracking

### Routes (`src/routes/incomeRouter.js`)

- `POST /api/income/addIncome` — Record income.
- `GET /api/income/readIncome` — Get user income entries.
- `PUT /api/income/updateIncome/:income_id` — Update income.
- `DELETE /api/income/deleteIncome/:income_id` — Delete income.

### Model

- `src/controllers/incomeController.js` validates and formats responses.
- `src/models/incomeModel.js` uses Prisma for create/read and raw SQL for update/delete.

## 9. Category Customization

### Routes (`src/routes/categoryRouter.js`)

- `POST /api/category/customCategory` — Create a custom category for a user
- Categories can be global (user_id = NULL) or user-specific
- Each category has optional icon support

### Database

- Enforces unique constraint on `(user_id, name)` pairs to prevent duplicates
- Used across expense and budget entities

## 10. Transaction Management

### Routes (`src/routes/transactionRouter.js`)

- `GET /api/transactions/daily` — Get transactions for a specific date (default: today)
  - Query params: `date` (YYYY-MM-DD format), `type` (filter by transaction type)
  - Returns all expenses and income for the given date
- `GET /api/transactions/monthly/:year?/:month?` — Get transactions for a specific month
  - Path params: `year` (optional), `month` (optional, 1-12)
  - Returns aggregated transaction data by category or date

### Controller / Model

- `src/controllers/transactionController.js` handles request parsing and response formatting
- `src/models/transactionModel.js` queries combined expense and income data
- Supports filtering by transaction type (expense/income)
- Useful for dashboards, insights, and analytics

## 11. Validation

### `src/validations/authValidation.js`

- Sign-up validation for username, full name, email, and password.
- Sign-in validation for identifier and password.
- Validation results return 422 with error messages.

### `src/validations/profileValidation.js`

- Optional validation rules for profile updates.
- Ensures username, email, and full_name meet format constraints.

## 12. Middleware

### Rate Limiting — `src/middleware/rateLimiter.js`

- Login limiter: 5 attempts per 2 minutes.
- API limiter: 100 requests per 2 minutes.
- `apiLimiter` applies globally to all routes.

### Authentication — `src/middleware/authMiddleware.js`

- JWT verification from `Authorization: Bearer <token>` header
- Attaches decoded user data to `req.user`
- Returns 401 for missing/invalid tokens

### Request Logging — `src/middleware/loggerMiddleware.js`

- Uses Morgan `dev` format for HTTP request logging.

## 13. Database Layer

### Database Schema (`prisma/schema.prisma`)

#### User Model

```
- user_id (PK): Auto-increment integer
- username: Unique, up to 100 chars
- email: Unique, up to 100 chars
- password_hash: Hashed password
- full_name: Optional, up to 225 chars
- created_at: Auto-generated timestamp
- reset_code: For password recovery (optional)
- reset_code_expires: Expiration time for reset code
- Relations: budgets, categories, expenses, income
```

#### Expense Model

```
- expense_id (PK): Auto-increment integer
- user_id (FK): Owner of expense
- amount: Decimal (10,2)
- description: Text
- category_id (FK): Category reference
- created_at: Auto-generated timestamp
- Indexes: user_id, category_id
```

#### Budget Model

```
- budget_id (PK): Auto-increment integer
- user_id (FK): Owner of budget
- category_id (FK): Category reference
- amount_limit: Decimal (10,2)
- start_date: Date
- end_date: Date
- period: Optional period indicator
- created_at: Auto-generated timestamp
- Indexes: user_id, category_id
```

#### Income Model

```
- income_id (PK): Auto-increment integer
- user_id (FK): Owner of income
- amount: Decimal (10,2)
- source: Up to 50 chars
- method: Up to 50 chars (e.g., salary, freelance)
- description: Text
- received_at: Auto-generated timestamp
- Indexes: user_id
```

#### Categories Model

```
- category_id (PK): Auto-increment integer
- user_id (FK): NULL for global, set for custom user categories
- name: Up to 100 chars
- icon: Optional, up to 100 chars
- created_at: Auto-generated timestamp
- Unique constraint: (user_id, name) per user
- Indexes: user_id
```

### `src/config/db.js`

- Configures PostgreSQL `pg.Pool`
- Includes helper to convert `?` placeholders into `$1`, `$2`, ...
- Used by raw SQL code in selected models

### `src/models/prisma.js`

- Sets up Prisma with `@prisma/adapter-pg` and `pg.Pool`
- Exports a Prisma client instance used across all models
- Prisma client generated to `src/generated/`

## 14. Utilities

### Token Generation

- `src/utils/generateToken.js` creates JWTs with 1-day expiration.
- Uses `process.env.JWT_SECRET` for signing.

### Budget Alerts

- `src/utils/budgetAlert.js` checks existing budgets for matching category and date range.
- Produces warning or danger alerts when spending exceeds thresholds.
- Triggers on expense creation and updates.

### Date Helpers

- `src/utils/dateCalc.js` provides `addMonths()` and `diffInMonths()` utilities.
- Used for budget period calculations.

### Email Utilities

- `src/utils/sendEmail.js` handles sending password recovery emails via Nodemailer.

## 15. Environment Configuration

Create a `.env` file in the Backend root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_spend
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_k
JWT_EXPIRATION=1d

# Email Configuration (for password recovery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Database URL (alternative to individual variables)
DATABASE_URL=postgresql://user:password@localhost:5432/smart_spend
```

## 16. Setup & Installation

### Prerequisites

- Node.js v16+
- PostgreSQL database

### Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if available)
   - Update with your actual database credentials

3. **Initialize Prisma:**

   ```bash
   npx prisma migrate dev --name init
   ```

   This creates the database schema from `prisma/schema.prisma`

4. **Start development server:**

   ```bash
   npm start
   ```

   Uses Nodemon for auto-restart on file changes. Server runs on configured PORT (default: 5000)

5. **Verify connection:**
   - Check terminal for successful database connection message
   - Test endpoints with Postman or similar tools

## 17. Running the Application

### Development Mode

```bash
npm start          # With Nodemon (auto-restart)
```

### Production Mode

```bash
npm run dev        # Plain Node.js execution
```

## 18. API Testing

### Authentication Flow

1. Sign up: `POST /api/user/signUp`
2. Sign in: `POST /api/user/signIn` (receive JWT)
3. Use token in header: `Authorization: Bearer <token>`

### Example Request

```bash
curl -X GET http://localhost:5000/api/expenses/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 19. Project Scripts

| Script                   | Purpose                       |
| ------------------------ | ----------------------------- |
| `npm install`            | Install dependencies          |
| `npm start`              | Start with Nodemon (dev)      |
| `npm run dev`            | Start with plain Node.js      |
| `npx prisma migrate dev` | Run migrations                |
| `npx prisma studio`      | Open Prisma Studio GUI        |
| `npx prisma db seed`     | Seed database (if configured) |

## 20. Notes & Best Practices

- **Mix of ORM & Raw SQL**: The app uses Prisma for most operations but raw SQL in selected models for complex queries
- **Per-User Data Isolation**: All protected routes require JWT authentication and filter data by `user_id`
- **Rate Limiting**: Global limiter (100 req/2min) prevents abuse; login has stricter limit (5 attempts/2min)
- **Error Handling**: Global error handler catches unhandled exceptions; individual controllers should use try-catch
- **Validation**: All user inputs validated before database operations to prevent invalid data
- **Date Handling**: Budget logic includes sophisticated date calculations for monthly/yearly periods
- **Cascading Deletes**: Deleting a user cascades to all related expenses, budgets, income, and categories
- **JWT Expiration**: Tokens expire after 1 day; clients must refresh by re-authenticating
