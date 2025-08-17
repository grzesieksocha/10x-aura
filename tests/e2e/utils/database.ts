import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/db/database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const testUserId = process.env.E2E_USERNAME_ID;

if (!supabaseUrl || !supabaseKey || !testUserId) {
  throw new Error("Missing required environment variables for E2E testing");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function cleanupUserData(userId = testUserId) {
  if (!userId) {
    throw new Error("User ID is required for cleanup");
  }

  const { error: transactionsError } = await supabase.from("transactions").delete().eq("user_id", userId);

  if (transactionsError) {
    throw new Error(`Error deleting transactions: ${transactionsError.message}`);
  }

  const { error: accountsError } = await supabase.from("accounts").delete().eq("user_id", userId);

  if (accountsError) {
    throw new Error(`Error deleting accounts: ${accountsError.message}`);
  }

  const { error: categoriesError } = await supabase.from("categories").delete().eq("user_id", userId);

  if (categoriesError) {
    throw new Error(`Error deleting categories: ${categoriesError.message}`);
  }

  const { error: budgetError } = await supabase.from("budget").delete().eq("user_id", userId);

  if (budgetError) {
    throw new Error(`Error deleting budget: ${budgetError.message}`);
  }
}

export async function verifyCleanDatabase(userId = testUserId) {
  if (!userId) {
    throw new Error("User ID is required for verification");
  }

  const [accounts, transactions, categories, budget] = await Promise.all([
    supabase.from("accounts").select("id").eq("user_id", userId),
    supabase.from("transactions").select("id").eq("user_id", userId),
    supabase.from("categories").select("id").eq("user_id", userId),
    supabase.from("budget").select("id").eq("user_id", userId),
  ]);

  const counts = {
    accounts: accounts.data?.length || 0,
    transactions: transactions.data?.length || 0,
    categories: categories.data?.length || 0,
    budget: budget.data?.length || 0,
  };

  return counts;
}

export async function createTestAccount(name = "Test Account", initialBalance = 0, userId = testUserId) {
  if (!userId) {
    throw new Error("User ID is required to create test account");
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name,
      user_id: userId,
      initial_balance: initialBalance,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test account: ${error.message}`);
  }

  if (initialBalance > 0) {
    const { error: transactionError } = await supabase.from("transactions").insert({
      account_id: data.id,
      user_id: userId,
      amount: initialBalance,
      transaction_type: "revenue",
      description: "Initial balance",
      transaction_date: new Date().toISOString(),
    });

    if (transactionError) {
      throw new Error(`Failed to create initial transaction: ${transactionError.message}`);
    }
  }

  return data;
}
