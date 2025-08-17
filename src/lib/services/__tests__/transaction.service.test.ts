import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionService, type TransactionFilters } from "../transaction.service";
import { ApiError } from "../../api/errors";
import type { SupabaseClientType } from "../../../db/supabase.client";
import type { Database } from "../../../db/database.types";

type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClientType;

describe("TransactionService", () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionService = new TransactionService(mockSupabase);
  });

  describe("dollarsToCents conversion", () => {
    it("should convert dollars to cents correctly", async () => {
      const mockAccount = { id: 1 };
      const mockCategory = { id: 1 };
      const mockTransaction = {
        id: 1,
        amount: 2550, // 25.50 in cents
        transaction_type: "expense",
        user_id: "user-123",
        account_id: 1,
        category_id: 1,
        transaction_date: "2024-01-01",
        description: "Test transaction",
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccount, error: null }),
      };

      // Mock category validation
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
      };

      // Mock insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockAccountQuery)
        .mockReturnValueOnce(mockCategoryQuery)
        .mockReturnValueOnce(mockInsertQuery);

      const result = await transactionService.createTransaction("user-123", {
        account_id: 1,
        category_id: 1,
        amount: 25.5,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        description: "Test transaction",
      });

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        account_id: 1,
        category_id: 1,
        amount: 2550,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        description: "Test transaction",
      });
      expect(result.amount).toBe(25.5);
    });
  });

  describe("createTransaction", () => {
    it("should create transaction successfully with category", async () => {
      const transactionData = {
        account_id: 1,
        category_id: 10,
        amount: 50.0,
        transaction_type: "expense" as const,
        transaction_date: "2024-01-01",
        description: "Groceries",
      };

      const mockTransaction = {
        id: 1,
        user_id: "user-123",
        amount: 5000, // 50.0 dollars in cents
        account_id: 1,
        category_id: 10,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        description: "Groceries",
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock category validation
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 10 }, error: null }),
      };

      // Mock transaction insert
      const mockTransactionQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockAccountQuery)
        .mockReturnValueOnce(mockCategoryQuery)
        .mockReturnValueOnce(mockTransactionQuery);

      const result = await transactionService.createTransaction("user-123", transactionData);

      expect(result.amount).toBe(50.0);
      expect(result.id).toBe(mockTransaction.id);
      expect(result.description).toBe(mockTransaction.description);
    });

    it("should create transaction successfully without category", async () => {
      const transactionData = {
        account_id: 1,
        amount: 100.0,
        transaction_type: "income" as const,
        transaction_date: "2024-01-01",
        description: "Salary",
      };

      const mockTransaction = {
        id: 1,
        user_id: "user-123",
        amount: 10000, // 100.0 dollars in cents
        account_id: 1,
        category_id: null,
        transaction_type: "income",
        transaction_date: "2024-01-01",
        description: "Salary",
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockTransactionQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockTransactionQuery);

      const result = await transactionService.createTransaction("user-123", transactionData);

      expect(result.amount).toBe(100.0);
      expect(result.category_id).toBeNull();
      expect(result.id).toBe(mockTransaction.id);
    });

    it("should throw ApiError when account not found", async () => {
      const transactionData = {
        account_id: 999,
        amount: 50.0,
        transaction_type: "expense" as const,
        transaction_date: "2024-01-01",
        description: "Test",
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(transactionService.createTransaction("user-123", transactionData)).rejects.toThrow(
        new ApiError(404, "Account with ID 999 not found or does not belong to the user")
      );
    });

    it("should throw ApiError when category not found", async () => {
      const transactionData = {
        account_id: 1,
        category_id: 999,
        amount: 50.0,
        transaction_type: "expense" as const,
        transaction_date: "2024-01-01",
        description: "Test",
      };

      // Mock account validation success
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock category validation failure
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockCategoryQuery);

      await expect(transactionService.createTransaction("user-123", transactionData)).rejects.toThrow(
        new ApiError(404, "Category not found or does not belong to the user")
      );
    });
  });

  describe("listTransactions", () => {
    it("should return transactions with all filters applied", async () => {
      const filters: TransactionFilters = {
        accountId: 1,
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
        categoryId: 10,
        type: ["expense"],
      };

      const mockTransactions = [
        {
          id: 1,
          amount: 5000,
          transaction_type: "expense",
          account_id: 1,
          category_id: 10,
          transaction_date: "2024-01-15",
          description: "Groceries",
          category: { id: 10, name: "Food" },
          related_transaction: null,
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.listTransactions("user-123", filters);

      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockQuery.eq).toHaveBeenCalledWith("account_id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("category_id", 10);
      expect(mockQuery.gte).toHaveBeenCalledWith("transaction_date", "2024-01-01");
      expect(mockQuery.lte).toHaveBeenCalledWith("transaction_date", "2024-01-31");
      expect(mockQuery.in).toHaveBeenCalledWith("transaction_type", ["expense"]);
      expect(mockQuery.order).toHaveBeenCalledWith("transaction_date", { ascending: false });
      expect(result[0].amount).toBe(50.0);
    });

    it("should return transactions without filters", async () => {
      const mockTransactions = [
        {
          id: 1,
          amount: 10000,
          transaction_type: "income",
          related_transaction: {
            id: 2,
            amount: 5000,
          },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.listTransactions("user-123");

      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result[0].amount).toBe(100.0);
      expect(result[0].related_transaction.amount).toBe(50.0);
    });

    it("should return empty array when no transactions found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.listTransactions("user-123");

      expect(result).toEqual([]);
    });

    it("should throw ApiError when database query fails", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection timeout" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(transactionService.listTransactions("user-123")).rejects.toThrow(
        new ApiError(500, "Failed to fetch transactions: Connection timeout")
      );
    });
  });

  describe("getTransactionById", () => {
    it("should return transaction with related transaction", async () => {
      const mockTransaction = {
        id: 1,
        amount: 5000,
        transaction_type: "transfer",
        category: { id: 10, name: "Food" },
        related_transaction: {
          id: 2,
          amount: 5000,
          transaction_type: "transfer",
        },
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.getTransactionById("user-123", 1);

      expect(mockQuery.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result.amount).toBe(50.0);
      expect(result.related_transaction.amount).toBe(50.0);
    });

    it("should return null when transaction not found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.getTransactionById("user-123", 999);

      expect(result).toBeNull();
    });

    it("should throw ApiError when database error occurs", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(transactionService.getTransactionById("user-123", 1)).rejects.toThrow(
        new ApiError(500, "Failed to fetch transaction: Database error")
      );
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction successfully", async () => {
      const updateData: TransactionUpdate = {
        amount: 75.0,
        description: "Updated groceries",
      };

      const existingTransaction = {
        id: 1,
        amount: 50.0,
        description: "Groceries",
      };

      const updatedTransaction = {
        id: 1,
        amount: 7500,
        description: "Updated groceries",
        user_id: "user-123",
        account_id: 1,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        created_at: new Date().toISOString(),
      };

      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(existingTransaction);

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.updateTransaction("user-123", 1, updateData);

      expect(mockQuery.update).toHaveBeenCalledWith({
        amount: 7500,
        description: "Updated groceries",
      });
      expect(result.amount).toBe(75.0);
    });

    it("should return null when transaction doesn't exist", async () => {
      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(null);

      const result = await transactionService.updateTransaction("user-123", 999, {
        description: "Test",
      });

      expect(result).toBeNull();
    });

    it("should update transaction without amount conversion", async () => {
      const updateData: TransactionUpdate = {
        description: "Updated description only",
      };

      const existingTransaction = {
        id: 1,
        amount: 50.0,
        description: "Original",
      };

      const updatedTransaction = {
        id: 1,
        amount: 5000,
        description: "Updated description only",
        user_id: "user-123",
        account_id: 1,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        created_at: new Date().toISOString(),
      };

      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(existingTransaction);

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.updateTransaction("user-123", 1, updateData);

      expect(mockQuery.update).toHaveBeenCalledWith({
        description: "Updated description only",
      });
      expect(result.amount).toBe(50.0);
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", async () => {
      const existingTransaction = {
        id: 1,
        amount: 50.0,
        description: "Test transaction",
      };

      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(existingTransaction);

      const mockFirstEq = vi.fn().mockReturnThis();
      const mockSecondEq = vi.fn().mockResolvedValue({ error: null });
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: mockFirstEq,
      };

      mockFirstEq.mockReturnValue({
        eq: mockSecondEq,
      });

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await transactionService.deleteTransaction("user-123", 1);

      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockFirstEq).toHaveBeenCalledWith("id", 1);
      expect(mockSecondEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toBe(true);
    });

    it("should return false when transaction doesn't exist", async () => {
      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(null);

      const result = await transactionService.deleteTransaction("user-123", 999);

      expect(result).toBe(false);
    });

    it("should throw ApiError when delete fails", async () => {
      const existingTransaction = {
        id: 1,
        amount: 50.0,
        description: "Test transaction",
      };

      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(existingTransaction);

      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: "Foreign key constraint" },
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(transactionService.deleteTransaction("user-123", 1)).rejects.toThrow(
        new ApiError(500, "Failed to delete transaction: Foreign key constraint")
      );
    });
  });

  describe("createTransfer", () => {
    it("should create transfer between accounts successfully", async () => {
      const transferCommand = {
        user_id: "user-123",
        source_account_id: 1,
        destination_account_id: 2,
        amount: 100.0,
        transaction_date: "2024-01-01",
        description: "Transfer to savings",
      };

      const sourceTransaction = {
        id: 1,
        user_id: "user-123",
        account_id: 1,
        amount: -10000,
        transaction_type: "transfer",
        transaction_date: "2024-01-01",
        description: "Transfer to savings",
        related_transaction_id: null,
        created_at: new Date().toISOString(),
      };

      const destinationTransaction = {
        id: 2,
        user_id: "user-123",
        account_id: 2,
        amount: 10000,
        transaction_type: "transfer",
        transaction_date: "2024-01-01",
        description: "Transfer to savings",
        related_transaction_id: 1,
        created_at: new Date().toISOString(),
      };

      // Mock account validations
      const mockAccountQuery1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      const mockAccountQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 2 }, error: null }),
      };

      // Mock transaction inserts
      const mockSourceInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: sourceTransaction, error: null }),
      };

      const mockDestinationInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: destinationTransaction, error: null }),
      };

      // Mock update for relation
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockUpdateQuery.eq.mockResolvedValue({ error: null });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockAccountQuery1)
        .mockReturnValueOnce(mockAccountQuery2)
        .mockReturnValueOnce(mockSourceInsert)
        .mockReturnValueOnce(mockDestinationInsert)
        .mockReturnValueOnce(mockUpdateQuery);

      const result = await transactionService.createTransfer(transferCommand);

      expect(result.source_transaction.amount).toBe(-100.0);
      expect(result.destination_transaction.amount).toBe(100.0);
      expect(mockSourceInsert.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        account_id: 1,
        amount: -10000,
        transaction_date: "2024-01-01",
        description: "Transfer to savings",
        transaction_type: "transfer",
        category_id: null,
        related_transaction_id: null,
      });
    });

    it("should create revenue transaction when destination is null and amount positive", async () => {
      const transferCommand = {
        user_id: "user-123",
        source_account_id: 1,
        destination_account_id: null,
        amount: 500.0,
        transaction_date: "2024-01-01",
        description: "Salary deposit",
      };

      const transaction = {
        id: 1,
        user_id: "user-123",
        account_id: 1,
        amount: 50000,
        transaction_type: "revenue",
        transaction_date: "2024-01-01",
        description: "Salary deposit",
        category_id: null,
        related_transaction_id: null,
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: transaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockInsertQuery);

      const result = await transactionService.createTransfer(transferCommand);

      expect(result.source_transaction.amount).toBe(500.0);
      expect(result.destination_transaction).toBeNull();
      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        account_id: 1,
        amount: 50000,
        transaction_date: "2024-01-01",
        description: "Salary deposit",
        transaction_type: "revenue",
        category_id: null,
        related_transaction_id: null,
      });
    });

    it("should create expense transaction when destination is null and amount negative", async () => {
      const transferCommand = {
        user_id: "user-123",
        source_account_id: 1,
        destination_account_id: null,
        amount: -50.0,
        transaction_date: "2024-01-01",
        description: "ATM withdrawal",
      };

      const transaction = {
        id: 1,
        user_id: "user-123",
        account_id: 1,
        amount: -5000,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        description: "ATM withdrawal",
        category_id: null,
        related_transaction_id: null,
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: transaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockInsertQuery);

      const result = await transactionService.createTransfer(transferCommand);

      expect(result.source_transaction.amount).toBe(-50.0);
      expect(result.destination_transaction).toBeNull();
    });

    it("should rollback on destination transaction failure", async () => {
      const transferCommand = {
        user_id: "user-123",
        source_account_id: 1,
        destination_account_id: 2,
        amount: 100.0,
        transaction_date: "2024-01-01",
        description: "Transfer",
      };

      const sourceTransaction = {
        id: 1,
        amount: -10000,
      };

      // Mock account validations
      const mockAccountQuery1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      const mockAccountQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 2 }, error: null }),
      };

      // Mock source transaction insert success
      const mockSourceInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: sourceTransaction, error: null }),
      };

      // Mock destination transaction insert failure
      const mockDestinationInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Insert failed" },
        }),
      };

      // Mock delete for rollback
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockDeleteQuery.eq.mockResolvedValue({ error: null });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockAccountQuery1)
        .mockReturnValueOnce(mockAccountQuery2)
        .mockReturnValueOnce(mockSourceInsert)
        .mockReturnValueOnce(mockDestinationInsert)
        .mockReturnValueOnce(mockDeleteQuery);

      await expect(transactionService.createTransfer(transferCommand)).rejects.toThrow(ApiError);
    });

    it("should throw ApiError when source account not found", async () => {
      const transferCommand = {
        user_id: "user-123",
        source_account_id: 999,
        destination_account_id: 2,
        amount: 100.0,
        transaction_date: "2024-01-01",
        description: "Transfer",
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(transactionService.createTransfer(transferCommand)).rejects.toThrow(
        new ApiError(404, "Account with ID 999 not found or does not belong to the user")
      );
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount transactions", async () => {
      const transactionData = {
        account_id: 1,
        amount: 0.0,
        transaction_type: "expense" as const,
        transaction_date: "2024-01-01",
        description: "Zero amount test",
      };

      const mockTransaction = {
        id: 1,
        user_id: "user-123",
        amount: 0,
        ...transactionData,
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockTransactionQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockTransactionQuery);

      const result = await transactionService.createTransaction("user-123", transactionData);

      expect(result.amount).toBe(0.0);
    });

    it("should handle very large amounts correctly", async () => {
      const largeAmount = 999999.99;
      const transactionData = {
        account_id: 1,
        amount: largeAmount,
        transaction_type: "income" as const,
        transaction_date: "2024-01-01",
        description: "Large amount test",
      };

      const mockTransaction = {
        id: 1,
        user_id: "user-123",
        amount: 99999999, // 999999.99 in cents
        account_id: 1,
        transaction_type: "income",
        transaction_date: "2024-01-01",
        description: "Large amount test",
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockTransactionQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockTransactionQuery);

      const result = await transactionService.createTransaction("user-123", transactionData);

      expect(result.amount).toBe(largeAmount);
    });

    it("should handle rounding correctly for cents conversion", async () => {
      const amount = 25.555; // Should round to 25.56
      const transactionData = {
        account_id: 1,
        amount: amount,
        transaction_type: "expense" as const,
        transaction_date: "2024-01-01",
        description: "Rounding test",
      };

      const mockTransaction = {
        id: 1,
        user_id: "user-123",
        amount: 2556, // 25.56 in cents
        account_id: 1,
        transaction_type: "expense",
        transaction_date: "2024-01-01",
        description: "Rounding test",
        created_at: new Date().toISOString(),
      };

      // Mock account validation
      const mockAccountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      };

      // Mock transaction insert
      const mockTransactionQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockAccountQuery).mockReturnValueOnce(mockTransactionQuery);

      const result = await transactionService.createTransaction("user-123", transactionData);

      expect(mockTransactionQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2556,
        })
      );
      expect(result.amount).toBe(25.56);
    });
  });
});
