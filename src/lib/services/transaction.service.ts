import type { SupabaseClientType } from "../../db/supabase.client";
import type { ValidatedTransfer, TransferTransactionResponse } from "../schemas/transfer.schema";
import type { Database } from "../../db/database.types";
import { ApiError } from "../api/errors";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];
type TransactionType = Database["public"]["Enums"]["transaction_type_enum"];

export interface TransactionFilters {
  accountId?: number;
  dateFrom?: string;
  dateTo?: string;
  categoryId?: number;
  type?: TransactionType[];
}

export class TransactionService {
  constructor(private readonly supabase: SupabaseClientType) {}

  async createTransaction(userId: string, data: Omit<TransactionInsert, "user_id">) {
    // Validate account ownership
    await this.validateAccountOwnership(userId, data.account_id);

    // If category is provided, validate it belongs to the user
    if (data.category_id) {
      const { data: category } = await this.supabase
        .from("categories")
        .select("id")
        .eq("id", data.category_id)
        .eq("user_id", userId)
        .single();

      if (!category) {
        throw new ApiError(404, "Category not found or does not belong to the user");
      }
    }

    return this.createSingleTransaction({
      ...data,
      user_id: userId,
    });
  }

  async listTransactions(userId: string, filters: TransactionFilters = {}) {
    let query = this.supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*),
        related_transaction:transactions(*)
      `
      )
      .eq("user_id", userId);

    if (filters.accountId) {
      query = query.eq("account_id", filters.accountId);
    }

    if (filters.dateFrom) {
      query = query.gte("transaction_date", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("transaction_date", filters.dateTo);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.type?.length) {
      query = query.in("transaction_type", filters.type);
    }

    const { data: transactions, error } = await query.order("transaction_date", { ascending: false });

    if (error) {
      throw new ApiError(500, `Failed to fetch transactions: ${error.message}`);
    }

    return transactions;
  }

  async getTransactionById(userId: string, id: number) {
    const { data: transaction, error } = await this.supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*),
        related_transaction:transactions(*)
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new ApiError(500, `Failed to fetch transaction: ${error.message}`);
    }

    return transaction;
  }

  async updateTransaction(userId: string, id: number, data: TransactionUpdate) {
    // First check if transaction exists and belongs to user
    const existing = await this.getTransactionById(userId, id);
    if (!existing) {
      return null;
    }

    const { data: transaction, error } = await this.supabase
      .from("transactions")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, `Failed to update transaction: ${error.message}`);
    }

    return transaction;
  }

  async deleteTransaction(userId: string, id: number): Promise<boolean> {
    // First check if transaction exists and belongs to user
    const existing = await this.getTransactionById(userId, id);
    if (!existing) {
      return false;
    }

    const { error } = await this.supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);

    if (error) {
      throw new ApiError(500, `Failed to delete transaction: ${error.message}`);
    }

    return true;
  }

  private async validateAccountOwnership(userId: string, accountId: number): Promise<void> {
    const { data: account } = await this.supabase
      .from("accounts")
      .select("id")
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (!account) {
      throw new ApiError(404, `Account with ID ${accountId} not found or does not belong to the user`);
    }
  }

  private async createSingleTransaction(data: TransactionInsert) {
    const { data: transaction, error } = await this.supabase.from("transactions").insert(data).select().single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction;
  }

  private async updateTransactionRelation(transactionId: number, relatedId: number) {
    const { error } = await this.supabase
      .from("transactions")
      .update({ related_transaction_id: relatedId })
      .eq("id", transactionId);

    if (error) {
      throw new Error(`Failed to update transaction relation: ${error.message}`);
    }
  }

  private async deleteTransactionInternal(transactionId: number) {
    const { error } = await this.supabase.from("transactions").delete().eq("id", transactionId);

    if (error) {
      console.error(`Failed to delete transaction ${transactionId}: ${error.message}`);
    }
  }

  async createTransfer(command: ValidatedTransfer): Promise<TransferTransactionResponse> {
    // Validate account ownership
    await this.validateAccountOwnership(command.user_id, command.source_account_id);
    if (command.destination_account_id !== null) {
      await this.validateAccountOwnership(command.user_id, command.destination_account_id);
    }

    // Determine transaction type based on destination and amount
    const transactionType: TransactionType =
      command.destination_account_id === null ? (command.amount < 0 ? "expense" : "revenue") : "transfer";

    try {
      // Create transactions
      if (transactionType === "transfer" && command.destination_account_id !== null) {
        // Create source transaction
        const sourceTransaction = await this.createSingleTransaction({
          user_id: command.user_id,
          account_id: command.source_account_id,
          amount: command.amount,
          transaction_date: command.transaction_date,
          description: command.description || null,
          transaction_type: transactionType,
          category_id: null,
          related_transaction_id: null,
        });

        try {
          // Create destination transaction
          const destinationTransaction = await this.createSingleTransaction({
            user_id: command.user_id,
            account_id: command.destination_account_id,
            amount: -command.amount, // Opposite amount for destination
            transaction_date: command.transaction_date,
            description: command.description || null,
            transaction_type: transactionType,
            category_id: null,
            related_transaction_id: sourceTransaction.id,
          });

          try {
            // Update source transaction with related_transaction_id
            await this.updateTransactionRelation(sourceTransaction.id, destinationTransaction.id);

            return {
              source_transaction: sourceTransaction,
              destination_transaction: destinationTransaction,
            };
          } catch (error) {
            // Rollback both transactions if update fails
            await this.deleteTransactionInternal(destinationTransaction.id);
            await this.deleteTransactionInternal(sourceTransaction.id);
            throw error;
          }
        } catch (error) {
          // Rollback source transaction if destination fails
          await this.deleteTransactionInternal(sourceTransaction.id);
          throw error;
        }
      } else {
        // Handle expense or revenue
        const transaction = await this.createSingleTransaction({
          user_id: command.user_id,
          account_id: command.source_account_id,
          amount: command.amount,
          transaction_date: command.transaction_date,
          description: command.description || null,
          transaction_type: transactionType,
          category_id: null,
          related_transaction_id: null,
        });

        return {
          source_transaction: transaction,
          destination_transaction: null,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(500, error.message);
      }
      throw new ApiError(500, "An unexpected error occurred while creating the transaction");
    }
  }
}
