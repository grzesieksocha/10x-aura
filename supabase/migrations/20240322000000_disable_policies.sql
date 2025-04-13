-- Migration: Disable All Policies
-- Description: Drops all RLS policies from tables
-- Author: AI Assistant
-- Date: 2024-03-22

-- Drop policies for accounts table
drop policy if exists "Users can view their own accounts" on accounts;
drop policy if exists "Users can insert their own accounts" on accounts;
drop policy if exists "Users can update their own accounts" on accounts;
drop policy if exists "Users can delete their own accounts" on accounts;

-- Drop policies for categories table
drop policy if exists "Users can view their own categories" on categories;
drop policy if exists "Users can insert their own categories" on categories;
drop policy if exists "Users can update their own categories" on categories;
drop policy if exists "Users can delete their own categories" on categories;

-- Drop policies for transactions table
drop policy if exists "Users can view their own transactions" on transactions;
drop policy if exists "Users can insert their own transactions" on transactions;
drop policy if exists "Users can update their own transactions" on transactions;
drop policy if exists "Users can delete their own transactions" on transactions;

-- Drop policies for budget table
drop policy if exists "Users can view their own budget entries" on budget;
drop policy if exists "Users can insert their own budget entries" on budget;
drop policy if exists "Users can update their own budget entries" on budget;
drop policy if exists "Users can delete their own budget entries" on budget;

-- Disable RLS on all tables
alter table accounts disable row level security;
alter table categories disable row level security;
alter table transactions disable row level security;
alter table budget disable row level security; 