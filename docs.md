# SmartSpend_Backend - Comprehensive Documentation

## **1. PROJECT OVERVIEW**

**SmartSpend_Backend** is a full-featured personal finance management API built with Node.js/Express and PostgreSQL. It enables users to track expenses, manage budgets, record income, and receive intelligent budget alerts.

**Key Characteristics:**

- RESTful API with JWT-based authentication
- Role-based access control (per-user data isolation)
- Real-time budget monitoring and alerts
- Rate limiting and input validation
- PostgreSQL database with Prisma ORM

---

## **2. TECHNOLOGY STACK & DEPENDENCIES**

**Core Framework:**

- **Express.js** (4.16.1) - Web server and routing
- **Node.js** with **Nodemon** (3.1.11) - Runtime and development auto-reload

**Database & ORM:**

- **PostgreSQL** (pg 8.20.0) - Relational database
- **Prisma** (7.4.2) - Modern ORM for type-safe database access
- **@prisma/adapter-pg** - PostgreSQL adapter for Prisma
- **@prisma/client** (7.4.2) - Auto-generated query client

**Security:**

- **bcrypt** (6.0.0) - Password hashing
- **jsonwebtoken** (9.0.3) - JWT token generation and verification
- **express-rate-limit** (8.2.1) - API rate limiting
- **cors** (2.8.5) - Cross-Origin Resource Sharing

**Validation & Utilities:**

- **express-validator** (7.3.1) - Input validation and sanitization
- **morgan** (1.9.1) - HTTP request logging
- **cookie-parser** (1.4.4) - Cookie parsing
- **dotenv** (17.2.3) - Environment variable management
- **uuid** (13.0.0) - Unique identifier generation
- **debug** - Debugging utility

---

## **3. DATABASE SCHEMA**

The database consists of **4 core tables** with cascading relationships:

**Users Table**

```
- user_id (PK, auto-increment)
- username (UNIQUE, VARCHAR 100)
- email (UNIQUE, VARCHAR 100)
- password_hash
- full_name (VARCHAR 225, optional)
- created_at (TIMESTAMP with default now())
```

**Expenses Table**

```
- expense_id (PK, auto-increment)
- user_id (FK → Users, onDelete: Cascade)
- amount (DECIMAL 10,2)
- description
- category (VARCHAR 100, optional)
- created_at (TIMESTAMP, default now())
```

**Budgets Table**

```
- budget_id (PK, auto-increment)
- user_id (FK → Users, onDelete: Cascade)
- category (VARCHAR 100)
- amount_limit (DECIMAL 10,2)
- period (INTEGER - duration in months)
- start_date (DATE)
- end_date (DATE)
- created_at (TIMESTAMP, default now())
```

**Income Table**

```
- income_id (PK, auto-increment)
- user_id (FK → Users, onDelete: Cascade)
- amount (DECIMAL 10,2)
- source (VARCHAR 50, optional)
- method (VARCHAR 50 - enum: Cash, Mobile Money, Bank Transfer, Cheque)
- description (optional)
- received_at (TIMESTAMP, default now())
```

---

## **4. AUTHENTICATION SYSTEM**

**JWT-Based Authentication:**

- **Token Generation**: 24-hour expiration
- **Token Storage**: Passed via Authorization header (`Bearer <token>`)
- **Payload**: Contains `user_id` for request identification

**Authentication Flow:**

1. User signs up with username, email, password, full_name
2. Password hashed with bcrypt (salt rounds: 10)
3. User signs in with username/email + password
4. JWT token returned on successful authentication
5. All protected routes require valid token in Authorization header

**Rate Limiting:**

- **Login attempts**: 5 per 2 minutes (strict limiter)
- **General API**: 100 requests per 2 minutes

---

## **5. API ENDPOINTS & ROUTES**

### **Authentication Routes** (`/api/user`)

| Method | Endpoint            | Authentication           | Purpose                         |
| ------ | ------------------- | ------------------------ | ------------------------------- |
| POST   | `/signUp`           | ❌ Public                | Register new user               |
| POST   | `/signIn`           | ❌ Public (rate-limited) | Login user, return JWT          |
| GET    | `/profile`          | ✅ Required              | Get basic profile info          |
| GET    | `/detailed_profile` | ✅ Required              | Get full profile with stats     |
| PUT    | `/update_profile`   | ✅ Required              | Update username/email/full_name |

### **Expense Routes** (`/api/expenses`)

| Method | Endpoint              | Authentication | Purpose                                    |
| ------ | --------------------- | -------------- | ------------------------------------------ |
| POST   | `/create`             | ✅ Required    | Create new expense (triggers budget check) |
| GET    | `/read`               | ✅ Required    | Get user's expenses                        |
| GET    | `/read_all`           | ✅ Required    | Get ALL expenses (admin access)            |
| PUT    | `/update/:expense_id` | ✅ Required    | Update expense details                     |
| DELETE | `/delete/:expense_id` | ✅ Required    | Delete expense                             |

**Budget Alert Integration:**

- When expense created/updated, system checks if it exceeds budget limits
- Returns alert with status (warning at 80%, danger at 100%)

### **Budget Routes** (`/api/budgets`)

| Method | Endpoint             | Authentication | Purpose                                   |
| ------ | -------------------- | -------------- | ----------------------------------------- |
| POST   | `/create`            | ✅ Required    | Create budget with category and limits    |
| GET    | `/read`              | ✅ Required    | Get user's budgets with spending progress |
| PUT    | `/update/:budget_id` | ✅ Required    | Update budget parameters                  |
| DELETE | `/delete/:budget_id` | ✅ Required    | Delete budget                             |

**Budget Features:**

- Flexible date specification (start_date + period OR start_date + end_date)
- Automatic date normalization and calculation
- Spending progress tracking (percentage & remaining amount)
- Status indicators: Safe (<80%), Warning (80-99%), Danger (≥100%)

### **Income Routes** (`/api/income`)

| Method | Endpoint                   | Authentication | Purpose                   |
| ------ | -------------------------- | -------------- | ------------------------- |
| POST   | `/addIncome`               | ✅ Required    | Record income             |
| GET    | `/readIncome`              | ✅ Required    | Get user's income sources |
| PUT    | `/updateIncome/:income_id` | ✅ Required    | Update income record      |
| DELETE | `/deleteIncome/:income_id` | ✅ Required    | Delete income record      |

**Income Validation:**

- Amount: positive number, ≤ 100,000,000
- Method: Must be one of (Cash, Mobile Money, Bank Transfer, Cheque)
- Required: amount, method

---

## **6. CORE FEATURES & BUSINESS LOGIC**

### **A. User Profile Management**

- **Basic Profile**: username, email, user_id
- **Detailed Profile**: Includes aggregated metrics:
  - Total budgets, expenses, income records
  - Total spent amount
  - Creation date

### **B. Expense Tracking**

- Track expenses by category with descriptions
- Automatic categorization support
- Timestamp recording for time-based analysis
- Linked to budget checking system

### **C. Budget Management**

- Create category-specific spending limits
- Flexible period definition (months or explicit dates)
- Intelligent date calculation and normalization:
  - If start + period provided → compute end_date
  - If start + end provided → compute period
  - If all three provided → validate consistency

### **D. Smart Budget Alerts** ([src/utils/budgetAlert.js](src/utils/budgetAlert.js))

**Alert System:**

```
Trigger: When expense is created or updated
Logic: Check if expense date falls within matching budget period
Alert Types:
  - DANGER: ≥100% of budget spent
  - WARNING: 80-99% of budget spent
  - SAFE: <80% of budget spent
  - NULL: No matching budget for category
```

**Alert Payload:**

```json
{
  "status": "warning|danger",
  "spent": <total_amount>,
  "limit": <budget_limit>,
  "percentage": "XX.XX%",
  "remaining": <amount_left>,
  "message": "Alert message with emoji"
}
```

### **E. Income Tracking**

- Record income from various sources
- Support multiple payment methods
- Source and description fields for context
- Received_at timestamp for tracking

---

## **7. ARCHITECTURE & DESIGN PATTERNS**

**MVC Pattern Implementation:**

```
controllers/ → Business logic layer
  ├── authController.js (Auth & Profile)
  ├── budgetController.js (Budget CRUD)
  ├── expenseController.js (Expense CRUD)
  └── incomeController.js (Income CRUD)

models/ → Data access layer
  ├── authModel.js (User queries)
  ├── budgetModel.js (Budget queries + calculations)
  ├── expenseModel.js (Expense queries + alerts)
  └── incomeModel.js (Income queries)

routes/ → API endpoint definitions
  ├── authRouter.js
  ├── budgetRouter.js
  ├── expenseRouter.js
  └── incomeRouter.js

middleware/ → Request processing
  ├── authMiddleware.js (JWT verification)
  ├── rateLimiter.js (Request throttling)
  └── loggerMiddleware.js (HTTP logging)

validations/ → Input validation rules
  ├── authValidation.js (SignUp/SignIn rules)
  └── profileValidation.js (Profile update rules)

utils/ → Utility functions
  ├── generateToken.js (JWT creation)
  ├── dateCalc.js (Date arithmetic)
  └── budgetAlert.js (Alert generation)

config/ → Configuration
  └── db.js (Database pool setup)
```

---

## **8. MIDDLEWARE & VALIDATION**

### **Authentication Middleware** ([src/middleware/authMiddleware.js](src/middleware/authMiddleware.js))

- Extracts Bearer token from Authorization header
- Verifies JWT signature and expiration
- Attaches decoded `user` object to request
- Returns 401 if token invalid/missing

### **Rate Limiting** ([src/middleware/rateLimiter.js](src/middleware/rateLimiter.js))

- **Login Limiter**: 5 attempts per 2 minutes
- **API Limiter**: 100 requests per 2 minutes
- Applied globally to all routes

### **Request Logging** ([src/middleware/loggerMiddleware.js](src/middleware/loggerMiddleware.js))

- Morgan logger in 'dev' format
- Logs: HTTP method, URL, status code, response time

### **Input Validation** (express-validator)

**SignUp Validation:**

- Username: 3-20 chars, alphanumeric + underscores
- Full Name: Letters and spaces only
- Email: Valid email format
- Password: Min 8 chars, must contain number

**SignIn Validation:**

- Identifier: Valid username or email
- Password: Required

**Profile Update Validation:**

- All fields optional
- Same format rules as signup when provided

---

## **9. UTILITY FUNCTIONS**

### **Token Generation** ([src/utils/generateToken.js](src/utils/generateToken.js))

```javascript
- Creates JWT with payload
- 24-hour expiration
- Uses JWT_SECRET from environment
```

### **Date Calculations** ([src/utils/dateCalc.js](src/utils/dateCalc.js))

```javascript
- addMonths(date, months): Add months to date
- diffInMonths(start, end): Calculate month difference
- Used for budget period normalization
```

---

## **10. ERROR HANDLING**

**Error Flow:**

1. Controllers use try-catch blocks
2. Errors passed to Express error middleware via `next(error)`
3. Global error handler returns 500 with error message
4. Validation errors return 422 with field-specific messages

**HTTP Status Codes:**

- 201: Created (POST success)
- 400: Bad Request (validation failure)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found
- 422: Unprocessable Entity (validation errors)
- 500: Server Error

---

## **11. DATA ACCESS LAYER (Prisma Integration)**

**Prisma Client Setup** ([src/models/prisma.js](src/models/prisma.js))

- PostgreSQL adapter via `@prisma/adapter-pg`
- Connection pooling with pg.Pool
- Generated client at `/src/generated`

**Key Queries:**

- `findUnique/findMany`: Read operations with filtering
- `create`: Insert with data validation
- `update/updateMany`: Modify records
- `delete`: Remove records
- `groupBy`: Aggregate operations (expense totals by category)

---

## **12. SERVER CONFIGURATION**

**Entry Point** ([app.js](app.js))

- Load environment variables via dotenv
- Initialize Express app
- Register routes with prefixes:
  - `/api/user` → Auth routes
  - `/api/expenses` → Expense routes
  - `/api/budgets` → Budget routes
  - `/api/income` → Income routes
- Apply middleware: CORS, JSON parser, rate limiter, logger
- Global error handler
- Database connection verification on startup
- Listen on PORT (default: 5000)

---

## **13. DEPLOYMENT CONFIGURATION**

**Environment Variables Required:**

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=<your-secret-key>
PORT=5000 (optional)
DB_USERNAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT (for fallback)
```

**Scripts:**

- `npm run dev`: Run with Node.js
- `npm start`: Run with Nodemon (auto-reload on file changes)

**Database Migration:**

- Prisma schema at [prisma/schema.prisma](prisma/schema.prisma)
- Generate client: `prisma generate`
- Create migrations: `prisma migrate dev`

---

## **14. IMPLEMENTATION HIGHLIGHTS**

**Smart Features:**

1. **Budget Flexibility**: Accepts dates three different ways (start+end, start+period, or all three)
2. **Cascading Deletes**: Deleting user cascades to expenses, budgets, income
3. **Real-time Alerts**: Expense creation immediately checks budget status
4. **Selective Data Exposure**: Controllers filter fields returned to clients (excludes password hashes)
5. **Method-Based Updates**: Only updates fields explicitly sent by client
6. **Transaction Safety**: All data operations through Prisma for consistency

**Security Measures:**

1. Password hashing with bcrypt
2. JWT token-based authentication
3. Rate limiting on sensitive endpoints
4. Input validation and sanitization
5. CORS enabled for controlled cross-origin requests
6. User data isolation (users only see their own records)

---

This backend is production-ready with comprehensive features for personal financial management, intelligent budget monitoring, and robust security practices.
