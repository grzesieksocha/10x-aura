import type { AccountResponseDTO, CreateAccountCommand, UpdateAccountCommand } from "../schemas/account.schema";
import type { SupabaseClientType } from "../../db/supabase.client";
import { TransactionService } from "./transaction.service";

export class AccountService {
  constructor(
    private readonly supabase: SupabaseClientType,
    private readonly transactionService: TransactionService
  ) {}

  async createAccount(userId: string, command: CreateAccountCommand): Promise<AccountResponseDTO> {
    const { data: account, error } = await this.supabase
      .from("accounts")
      .insert({
        user_id: userId,
        name: command.name,
        initial_balance: command.initial_balance,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }

    // Create initial credit transaction if initial balance is greater than 0
    if (command.initial_balance > 0) {
      // Note: createTransaction expects dollars and converts internally to cents
      await this.transactionService.createTransaction(userId, {
        account_id: account.id,
        amount: command.initial_balance, // Pass as dollars, createTransaction will convert to cents
        transaction_type: "revenue",
        transaction_date: new Date().toISOString(),
        description: "Initial balance",
        category_id: null,
      });
    }

    return {
      ...account,
      current_balance: account.initial_balance,
    };
  }

  async getAccounts(userId: string): Promise<AccountResponseDTO[]> {
    const { data: accounts, error } = await this.supabase
      .from("accounts")
      .select(
        `
        *,
        transactions (amount, transaction_type)
      `
      )
      .eq("user_id", userId)
      .order("id");

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    return accounts.map((account) => {
      const transactions = account.transactions || [];
      const balance = transactions.reduce((sum, tx) => {
        if (tx.transaction_type === "expense") {
          return sum - tx.amount / 100;
        }
        return sum + tx.amount / 100;
      }, 0);

      const accountDto: AccountResponseDTO = {
        id: account.id,
        user_id: account.user_id,
        name: account.name,
        initial_balance: account.initial_balance,
        current_balance: balance,
        created_at: account.created_at,
      };

      return accountDto;
    });
  }

  async getAccountById(userId: string, accountId: number): Promise<AccountResponseDTO | null> {
    const { data: account, error } = await this.supabase
      .from("accounts")
      .select(
        `
        *,
        transactions (amount, transaction_type)
      `
      )
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch account: ${error.message}`);
    }

    const transactions = account.transactions || [];
    const balance = transactions.reduce((sum, tx) => {
      if (tx.transaction_type === "expense") {
        return sum - tx.amount / 100;
      }
      return sum + tx.amount / 100;
    }, 0);

    return {
      id: account.id,
      user_id: account.user_id,
      name: account.name,
      initial_balance: account.initial_balance,
      current_balance: balance,
      created_at: account.created_at,
    };
  }

  async updateAccount(
    userId: string,
    accountId: number,
    command: UpdateAccountCommand
  ): Promise<AccountResponseDTO | null> {
    const { data: account, error } = await this.supabase
      .from("accounts")
      .update({ name: command.name })
      .eq("id", accountId)
      .eq("user_id", userId)
      .select(
        `
        *,
        transactions (amount, transaction_type)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to update account: ${error.message}`);
    }

    const transactions = account.transactions || [];
    const balance = transactions.reduce((sum, tx) => {
      if (tx.transaction_type === "expense") {
        return sum - tx.amount / 100;
      }
      return sum + tx.amount / 100;
    }, 0);

    return {
      id: account.id,
      user_id: account.user_id,
      name: account.name,
      initial_balance: account.initial_balance,
      current_balance: balance,
      created_at: account.created_at,
    };
  }

  async deleteAccount(userId: string, accountId: number): Promise<boolean> {
    const { error } = await this.supabase.from("accounts").delete().eq("id", accountId).eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") return false; // Not found
      throw new Error(`Failed to delete account: ${error.message}`);
    }

    return true;
  }
}
