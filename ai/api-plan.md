# REST API Plan

## 1. Resources

- **Accounts** (Database table: Accounts)
- **Categories** (Database table: Categories)
- **Transactions** (Database table: Transactions)
- **Budgets** (Database table: Budget)
- **Reports** (Aggregated data from Accounts, Transactions, and Budgets)

## 2. Endpoints

### Accounts

- **GET /api/accounts**

  - **Description:** Retrieve a list of user accounts.
  - **Query Parameters:** Pagination (`page`, `limit`), optional sorting.
  - **Response:** JSON array of account objects with fields: `id`, `user_id`, `name`, `initial_balance`, `current_balance`, `created_at`.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized, 500 Internal Server Error.

- **GET /api/accounts/{accountId}**

  - **Description:** Retrieve details of a specific account.
  - **Path Parameter:** accountId.
  - **Response:** JSON object with account details.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 404 Not Found, 401 Unauthorized.

- **POST /api/accounts**

  - **Description:** Create a new account.
  - **Request Body:**
    ```json
    {
      "name": "string",
      "initial_balance": number
    }
    ```
  - **Response:** Newly created account object.
  - **Success Codes:** 201 Created.
  - **Error Codes:** 400 Bad Request (e.g., duplicate name, missing fields), 401 Unauthorized.

- **PUT /api/accounts/{accountId}**

  - **Description:** Update account details (e.g., updating the account name if allowed).
  - **Request Body:**
    ```json
    {
      "name": "string"
    }
    ```
  - **Response:** Updated account object.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized.

- **DELETE /api/accounts/{accountId}**
  - **Description:** Delete an account and all its associated transactions.
  - **Response:** Confirmation message.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 404 Not Found, 401 Unauthorized.

### Categories

- **GET /api/categories**

  - **Description:** Retrieve a list of categories (both predefined and user-defined).
  - **Response:** Array of category objects with fields: `id`, `name`, `is_revenue`, `created_at`.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized.

- **POST /api/categories**

  - **Description:** Create a new category.
  - **Request Body:**
    ```json
    {
      "name": "string",
      "is_revenue": boolean
    }
    ```
  - **Response:** The created category object.
  - **Success Codes:** 201 Created.
  - **Error Codes:** 400 Bad Request (e.g., name conflict, missing fields), 401 Unauthorized.

- **PATCH /api/categories/{categoryId}**

  - **Description:** Update the name of a user-defined category.
  - **Request Body:**
    ```json
    {
      "name": "string"
    }
    ```
  - **Response:** Updated category object.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 400 Bad Request (duplicate name, empty field), 404 Not Found, 401 Unauthorized.

- **DELETE /api/categories/{categoryId}**
  - **Description:** Delete a category that is not in use.
  - **Response:** Confirmation message.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 400 Bad Request (if category is in use), 404 Not Found, 401 Unauthorized.

### Transactions

- **GET /api/transactions**

  - **Description:** Retrieve a list of transactions, optionally filtered by account, date range, or transaction type.
  - **Query Parameters:** `account_id`, `type` (expense, revenue, transfer), `start_date`, `end_date`, plus pagination (`page`, `limit`) and sorting options.
  - **Response:** Array of transaction objects with fields: `id`, `account_id`, `category_id`, `amount`, `transaction_date`, `transaction_type`, `description`, `related_transaction_id`, `created_at`.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized.

- **GET /api/transactions/{transactionId}**

  - **Description:** Retrieve details of a specific transaction.
  - **Path Parameter:** transactionId.
  - **Response:** Transaction object.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 404 Not Found, 401 Unauthorized.

- **POST /api/transactions**

  - **Description:** Create a new transaction (Expense or Revenue).
  - **Request Body:**
    ```json
    {
      "account_id": number,
      "category_id": number,
      "amount": number,
      "transaction_date": "ISO8601 string",
      "transaction_type": "expense" | "revenue",
      "description": "string (optional)"
    }
    ```
  - **Response:** The created transaction object.
  - **Success Codes:** 201 Created.
  - **Error Codes:** 400 Bad Request (missing or invalid fields), 401 Unauthorized.

- **PATCH /api/transactions/{transactionId}**

  - **Description:** Update a transaction (applicable for expense or revenue types only).
  - **Request Body:**
    ```json
    {
      "account_id": number,
      "category_id": number,
      "amount": number,
      "transaction_date": "ISO8601 string",
      "description": "string (optional)"
    }
    ```
  - **Response:** Updated transaction object.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized.

- **DELETE /api/transactions/{transactionId}**

  - **Description:** Delete a transaction.
  - **Response:** Confirmation message.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 404 Not Found, 401 Unauthorized.

- **POST /api/transactions/transfer**
  - **Description:** Create a transfer transaction between two accounts. This endpoint automatically creates two linked records — one debiting the source account and one crediting the destination account.
  - **Request Body:**
    ```json
    {
      "source_account_id": number,
      "destination_account_id": number,
      "amount": number,
      "transaction_date": "ISO8601 string",
      "description": "string (optional)"
    }
    ```
  - **Response:** An object containing both created transaction records.
  - **Success Codes:** 201 Created.
  - **Error Codes:** 400 Bad Request (e.g., same source and destination, missing fields), 401 Unauthorized.

### Budgets

- **GET /api/budgets**

  - **Description:** Retrieve budget records for a specified year.
  - **Query Parameters:** `year` (e.g., 2023), with optional pagination.
  - **Response:** Array of budget objects with fields: `id`, `category_id`, `budget_date`, `planned_amount`, `created_at`.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized.

- **POST /api/budgets**

  - **Description:** Create or update a budget record.
  - **Request Body:**
    ```json
    {
      "category_id": number,
      "budget_date": "YYYY-MM-01",
      "planned_amount": number
    }
    ```
  - **Response:** The created or updated budget object.
  - **Success Codes:** 201 Created or 200 OK.
  - **Error Codes:** 400 Bad Request (e.g., duplicate entry), 401 Unauthorized.

- **PUT /api/budgets/{budgetId}**
  - **Description:** Update an existing budget record.
  - **Request Body:**
    ```json
    {
      "planned_amount": number
    }
    ```
  - **Response:** Updated budget object.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized.

### Reports

- **GET /api/reports/overview**

  - **Description:** Retrieve a summary of overall financial status, including total balance across all accounts.
  - **Response:** JSON object with aggregated account balances and key metrics.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized.

- **GET /api/reports/category-breakdown**
  - **Description:** Retrieve expenditure breakdown by category for a specified month (for pie chart data).
  - **Query Parameters:** `month` (format: YYYY-MM).
  - **Response:** Array of objects where each includes a category and its total expense for that month.
  - **Success Codes:** 200 OK.
  - **Error Codes:** 401 Unauthorized.

## 3. Authentication and Authorization

- **Mechanism:** All endpoints (except any dedicated authentication routes provided by Supabase) require JWT Bearer token authentication.
- **Implementation:**
  - Requests must include an `Authorization: Bearer <token>` header.
  - The token payload should include the `user_id` which is used to scope database queries, enforced both at the API layer and by database-level Row Level Security (RLS).

## 4. Validation and Business Logic

- **Account Validation:**

  - The account `name` must be unique for each user.
  - `initial_balance` must be a valid number.

- **Category Validation:**

  - The category `name` must be unique per user (case insensitive).
  - Deletion is prevented if the category is associated with any transaction.

- **Transaction Validation:**

  - Required fields: `account_id`, `amount`, `transaction_date`, and `transaction_type` (must be either `expense` or `revenue`). For transfers, ensure that the `source_account_id` and `destination_account_id` differ.
  - Validate date formats (ISO8601) and numerical values.
  - If provided, the `category_id` must exist.

- **Budget Validation:**

  - `budget_date` must be the first day of the month (format: YYYY-MM-01).
  - There must not be duplicate budget entries for the same category and month for a given user.

- **Business Logic:**

  - Transfer transactions automatically generate two linked records to reflect the debit and credit effects on the respective accounts.
  - Account balances are computed as: Initial Balance + Revenues - Expenses + Net Transfers (incoming minus outgoing).
  - Aggregation endpoints (overview, category breakdown) compute data across multiple tables for analytical purposes.

- **Pagination, Filtering, and Sorting:**
  - List endpoints support pagination (`page`, `limit`), filtering (by account, date range, type), and sorting to optimize performance and usability.

## Security and Performance Considerations

- **Authentication:** Use JWT tokens and enforce Row Level Security (RLS) at the database level to ensure that users access only their own data.
- **Rate Limiting:** Implement rate limiting on endpoints to mitigate abuse and ensure stability.
- **Input Validation:** All input data will be validated to prevent SQL injection, improper data formats, and other security vulnerabilities.
- **Index Usage:** Database indexes (e.g., on `user_id` and `transaction_date`) are leveraged to enhance query performance for list endpoints.
- **Error Handling:** Standardized HTTP status codes and error messages will be used to communicate validation and processing errors to the client.
