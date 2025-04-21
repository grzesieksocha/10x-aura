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
      await this.transactionService.createTransfer({
        user_id: userId,
        source_account_id: account.id,
        destination_account_id: null,
        amount: command.initial_balance,
        transaction_date: new Date().toISOString(),
        description: "Initial balance",
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
        if (tx.transaction_type === "expense") return sum - tx.amount;
        if (tx.transaction_type === "revenue") return sum + tx.amount;
        return sum;
      }, account.initial_balance);

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
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch account: ${error.message}`);
    }

    const transactions = account.transactions || [];
    const balance = transactions.reduce((sum, tx) => {
      if (tx.transaction_type === "expense") return sum - tx.amount;
      if (tx.transaction_type === "revenue") return sum + tx.amount;
      return sum;
    }, account.initial_balance);

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
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to update account: ${error.message}`);
    }

    const transactions = account.transactions || [];
    const balance = transactions.reduce((sum, tx) => {
      if (tx.transaction_type === "expense") return sum - tx.amount;
      if (tx.transaction_type === "revenue") return sum + tx.amount;
      return sum;
    }, account.initial_balance);

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
