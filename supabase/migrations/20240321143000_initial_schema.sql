-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for Aura MVP including accounts, categories,
-- transactions, and budget tables with appropriate constraints and security policies.
-- Author: AI Assistant
-- Date: 2024-03-21

-- Create custom enum for transaction types
create type transaction_type_enum as enum ('expense', 'revenue', 'transfer');

-- Create accounts table
create table accounts (
    id serial primary key,
    user_id uuid not null,
    name varchar(255) not null,
    initial_balance integer not null,
    created_at timestamptz not null default now(),
    unique (user_id, name)
);

-- Create categories table
create table categories (
    id serial primary key,
    user_id uuid not null,
    name varchar(255) not null,
    is_revenue boolean not null default false,
    created_at timestamptz not null default now(),
    unique (user_id, name)
);

-- Create transactions table
create table transactions (
    id bigserial primary key,
    user_id uuid not null,
    account_id integer not null references accounts(id) on delete cascade,
    category_id integer references categories(id) on delete set null,
    amount integer not null,
    transaction_date timestamptz not null,
    transaction_type transaction_type_enum not null,
    description varchar(500),
    related_transaction_id bigint,
    created_at timestamptz not null default now()
);

-- Add self-reference for transfer transactions
alter table transactions
    add constraint fk_related_transaction
    foreign key (related_transaction_id) references transactions(id);

-- Create budget table
create table budget (
    id serial primary key,
    user_id uuid not null,
    category_id integer not null references categories(id) on delete cascade,
    budget_date date not null,
    planned_amount integer not null,
    created_at timestamptz not null default now(),
    unique (user_id, category_id, budget_date)
);

-- Create indexes for performance optimization
create index idx_accounts_user_id on accounts(user_id);
create index idx_categories_user_id on categories(user_id);
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_account_id on transactions(account_id);
create index idx_transactions_transaction_date on transactions(transaction_date);
create index idx_budget_user_id on budget(user_id);

-- Enable Row Level Security (RLS)
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budget enable row level security;

-- RLS Policies for accounts
create policy "Users can view their own accounts"
    on accounts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own accounts"
    on accounts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own accounts"
    on accounts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own accounts"
    on accounts for delete
    using (auth.uid() = user_id);

-- RLS Policies for categories
create policy "Users can view their own categories"
    on categories for select
    using (auth.uid() = user_id);

create policy "Users can insert their own categories"
    on categories for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own categories"
    on categories for update
    using (auth.uid() = user_id);

create policy "Users can delete their own categories"
    on categories for delete
    using (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Users can view their own transactions"
    on transactions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
    on transactions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
    on transactions for update
    using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
    on transactions for delete
    using (auth.uid() = user_id);

-- RLS Policies for budget
create policy "Users can view their own budget entries"
    on budget for select
    using (auth.uid() = user_id);

create policy "Users can insert their own budget entries"
    on budget for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own budget entries"
    on budget for update
    using (auth.uid() = user_id);

create policy "Users can delete their own budget entries"
    on budget for delete
    using (auth.uid() = user_id); 