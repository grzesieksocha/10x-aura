# Database Schema Design for Aura MVP

This document describes the comprehensive PostgreSQL database schema designed for the Aura MVP project. It covers table definitions with columns, data types, constraints, relationships, indexes, and notes on PostgreSQL Row-Level Security (RLS) policies.

---

## 1. Tables

### 1.1. Custom ENUM Type

```sql
CREATE TYPE transaction_type_enum AS ENUM ('expense', 'revenue', 'transfer');
```

### 1.2. Accounts

Holds user account details. Each account belongs to a user (managed by Supabase).

```sql
CREATE TABLE Accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,  -- Managed by Supabase (e.g., auth.users)
    name VARCHAR(255) NOT NULL,
    initial_balance INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);
```

### 1.3. Categories

Stores transaction categories. The flag `is_revenue` indicates whether a category is for revenue (true) or expense (false).

```sql
CREATE TABLE Categories (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_revenue BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);
```

### 1.4. Transactions

Contains all financial operations (expenses, revenues, transfers). Transfer operations are recorded as two linked rows using `related_transaction_id`.

Partitioning will be applied on `transaction_date` (monthly partitions) and queries will be optimized using indexes.

```sql
CREATE TABLE Transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    account_id INTEGER NOT NULL REFERENCES Accounts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES Categories(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,  -- Stored in grosze
    transaction_date TIMESTAMPTZ NOT NULL,
    transaction_type transaction_type_enum NOT NULL,
    description VARCHAR(500),
    related_transaction_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- Partition by RANGE (transaction_date) will be implemented via appropriate migration scripts
);

-- Self-reference for transfer transactions
ALTER TABLE Transactions
    ADD CONSTRAINT fk_related_transaction
    FOREIGN KEY (related_transaction_id) REFERENCES Transactions(id);
```

### 1.5. Budget

Defines planned amounts for each category per month. The field `budget_date` should represent the first day of the month (format: YYYY-MM-01).

```sql
CREATE TABLE Budget (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    category_id INTEGER NOT NULL REFERENCES Categories(id) ON DELETE CASCADE,
    budget_date DATE NOT NULL,  -- Set as the first day of the month
    planned_amount INTEGER NOT NULL,  -- Stored in grosze
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, category_id, budget_date)
);
```

---

## 2. Relationships

- **Accounts**: Each account is owned by a user identified by `user_id`.
- **Categories**: Each category is owned by a user. Categories are used to classify transactions and determine budget aggregation (expense vs. revenue).
- **Transactions**: Each transaction is linked to an account and user. Optionally, a transaction is linked to a category. For transfers, two entries are created and linked using `related_transaction_id`.
- **Budget**: Each budget record is associated with a category and user, representing the planned amount for that category in a given month.

---

## 3. Indexes

To optimize query performance, especially on user-specific data, the following indexes are recommended:

```sql
-- Accounts
CREATE INDEX idx_accounts_user_id ON Accounts(user_id);

-- Categories
CREATE INDEX idx_categories_user_id ON Categories(user_id);

-- Transactions
CREATE INDEX idx_transactions_user_id ON Transactions(user_id);
CREATE INDEX idx_transactions_account_id ON Transactions(account_id);
CREATE INDEX idx_transactions_transaction_date ON Transactions(transaction_date);

-- Budget
CREATE INDEX idx_budget_user_id ON Budget(user_id);
```

---

## 4. PostgreSQL Row-Level Security (RLS) Policies

RLS ensures that users access only their own data. Below is an example for the Accounts table. Similar policies should be applied to the other tables.

```sql
ALTER TABLE Accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_accounts ON Accounts
    FOR SELECT
    USING (user_id = current_setting('auth.uid')::UUID);

-- Similar RLS policies should be created for Transactions, Categories, and Budget tables.
```

_Note:_ Actual RLS implementations might differ based on Supabase configuration and project-specific requirements.

---

## 5. Additional Notes

- The `user_id` column leverages the Supabase-managed user identifier (UUID) and ensures every record is associated with a user.
- Monetary values are stored as integers representing amounts in grosze.
- The `transaction_type` uses the custom ENUM `transaction_type_enum` with values: 'expense', 'revenue', and 'transfer'.
- Transfer transactions are recorded as two rows (one debiting the source account and one crediting the destination account) linked via `related_transaction_id`.
- The `description` field in the Transactions table is limited to 500 characters.
- Unique constraints ensure a user cannot create duplicate account names or multiple budget records for the same category and month.
- The Transactions table is designed for partitioning by `transaction_date` (monthly partitions) and should be configured through migration scripts to optimize query performance.
- Validation rules for transfers (ensuring operations occur between accounts of the same user) are enforced at the API level with additional support from RLS.

---

This schema serves as the basis for creating database migrations and further optimizing the data model according to application performance needs and evolving product requirements.
