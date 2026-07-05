# Structural UML Diagram

## Class Diagram

This diagram provides a structural overview of the main application components in `smart_spend_backend`.

```mermaid
classDiagram
    class App {
        +Express app
        +configureRoutes()
        +useMiddleware()
    }

    class AuthRouter
    class BudgetRouter
    class CategoryRouter
    class DashboardRouter
    class ExpenseRouter
    class IncomeRouter
    class TransactionRouter

    class AuthController
    class BudgetController
    class CategoryController
    class DashboardController
    class ExpenseController
    class IncomeController
    class TransactionController

    class AuthModel
    class BudgetModel
    class CategoryModel
    class DashboardModel
    class ExpenseModel
    class IncomeModel
    class TransactionModel
    class PrismaClient

    class AuthMiddleware
    class LoggerMiddleware
    class RateLimiter

    class BudgetAlert
    class DateCalc
    class GenerateToken
    class SendEmail

    class AuthValidation
    class ProfileValidation

    App --> AuthRouter
    App --> BudgetRouter
    App --> CategoryRouter
    App --> DashboardRouter
    App --> ExpenseRouter
    App --> IncomeRouter
    App --> TransactionRouter
    App --> AuthMiddleware
    App --> LoggerMiddleware
    App --> RateLimiter

    AuthRouter --> AuthController
    BudgetRouter --> BudgetController
    CategoryRouter --> CategoryController
    DashboardRouter --> DashboardController
    ExpenseRouter --> ExpenseController
    IncomeRouter --> IncomeController
    TransactionRouter --> TransactionController

    AuthController --> AuthModel
    BudgetController --> BudgetModel
    CategoryController --> CategoryModel
    DashboardController --> DashboardModel
    ExpenseController --> ExpenseModel
    IncomeController --> IncomeModel
    TransactionController --> TransactionModel

    AuthController --> AuthValidation
    AuthController --> GenerateToken
    BudgetController --> BudgetAlert
    ExpenseController --> DateCalc
    IncomeController --> DateCalc
    TransactionController --> DateCalc

    AuthModel --> PrismaClient
    BudgetModel --> PrismaClient
    CategoryModel --> PrismaClient
    DashboardModel --> PrismaClient
    ExpenseModel --> PrismaClient
    IncomeModel --> PrismaClient
    TransactionModel --> PrismaClient

    SendEmail --> AuthController
    SendEmail --> BudgetController

    AuthMiddleware --> AuthModel
    LoggerMiddleware --> App
    RateLimiter --> App
```

### Notes
- `App` is the root of the server application.
- `Router` modules expose REST endpoints and delegate requests to controller classes.
- `Controller` modules coordinate business logic and interact with persistence models and utility classes.
- `Model` modules interact with the Prisma client to read/write data.
- `Middleware` modules provide request-level features like authentication, logging, and rate limiting.
- `Utils` and `Validation` modules support controllers and request handling.
