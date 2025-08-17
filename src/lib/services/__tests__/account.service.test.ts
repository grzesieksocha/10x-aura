import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountService } from "../account.service";
import { TransactionService } from "../transaction.service";
import type { SupabaseClientType } from "../../../db/supabase.client";

const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClientType;

const mockTransactionService = {
  createTransfer: vi.fn(),
  createTransaction: vi.fn(),
} as unknown as TransactionService;

describe("AccountService", () => {
  let accountService: AccountService;

  beforeEach(() => {
    vi.clearAllMocks();
    accountService = new AccountService(mockSupabase, mockTransactionService);
  });

  describe("createAccount", () => {
    it("should create account with zero initial balance", async () => {
      const mockAccount = {
        id: 123,
        name: "Test Account",
        initial_balance: 0,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccount, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.createAccount("user-123", {
        name: "Test Account",
        initial_balance: 0,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("accounts");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        name: "Test Account",
        initial_balance: 0,
      });
      expect(mockTransactionService.createTransfer).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockAccount,
        current_balance: 0,
      });
    });

    it("should create account with positive initial balance and create transfer", async () => {
      const mockAccount = {
        id: 123,
        name: "Savings Account",
        initial_balance: 1000,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccount, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);
      vi.mocked(mockTransactionService.createTransaction).mockResolvedValue({
        id: 1,
        amount: 1000,
        account_id: 123,
        category_id: null,
        created_at: new Date().toISOString(),
        description: "Initial balance",
        related_transaction_id: null,
        transaction_date: "2024-01-01",
        transaction_type: "revenue",
        user_id: "user-123",
      });

      const result = await accountService.createAccount("user-123", {
        name: "Savings Account",
        initial_balance: 1000,
      });

      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith("user-123", {
        account_id: 123,
        amount: 1000,
        transaction_type: "revenue",
        transaction_date: expect.any(String),
        description: "Initial balance",
        category_id: null,
      });
      expect(result).toEqual({
        ...mockAccount,
        current_balance: 1000,
      });
    });

    it("should throw error when database insert fails", async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(
        accountService.createAccount("user-123", {
          name: "Test Account",
          initial_balance: 0,
        })
      ).rejects.toThrow("Failed to create account: Database error");
    });
  });

  describe("getAccounts", () => {
    it("should return accounts with calculated balances", async () => {
      const mockAccountsData = [
        {
          id: 1,
          name: "Checking",
          initial_balance: 500,
          user_id: "user-123",
          created_at: new Date().toISOString(),
          transactions: [
            { amount: 10000, transaction_type: "income" },
            { amount: 3000, transaction_type: "expense" },
          ],
        },
        {
          id: 2,
          name: "Savings",
          initial_balance: 1000,
          user_id: "user-123",
          created_at: new Date().toISOString(),
          transactions: [],
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAccountsData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccounts("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("accounts");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockQuery.order).toHaveBeenCalledWith("id");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: "Checking",
        initial_balance: 500,
        user_id: "user-123",
        created_at: mockAccountsData[0].created_at,
        current_balance: 570, // 500 + 100 - 30
      });
      expect(result[1].current_balance).toBe(1000);
    });

    it("should throw error when database query fails", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection timeout" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(accountService.getAccounts("user-123")).rejects.toThrow(
        "Failed to fetch accounts: Connection timeout"
      );
    });
  });

  describe("getAccountById", () => {
    it("should return account with calculated balance", async () => {
      const mockAccountData = {
        id: 123,
        name: "Test Account",
        initial_balance: 100,
        user_id: "user-123",
        created_at: new Date().toISOString(),
        transactions: [
          { amount: 5000, transaction_type: "income" },
          { amount: 2000, transaction_type: "expense" },
        ],
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccountData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccountById("user-123", 123);

      expect(mockQuery.eq).toHaveBeenCalledWith("id", 123);
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual({
        id: 123,
        name: "Test Account",
        initial_balance: 100,
        user_id: "user-123",
        created_at: mockAccountData.created_at,
        current_balance: 130, // 100 + 50 - 20
      });
    });

    it("should return null when account not found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccountById("user-123", 999);

      expect(result).toBeNull();
    });

    it("should throw error when database error occurs", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "42P01", message: "Table not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(accountService.getAccountById("user-123", 123)).rejects.toThrow(
        "Failed to fetch account: Table not found"
      );
    });
  });

  describe("updateAccount", () => {
    it("should update account successfully", async () => {
      const mockUpdatedAccount = {
        id: 123,
        name: "Updated Account",
        initial_balance: 100,
        user_id: "user-123",
        created_at: new Date().toISOString(),
        transactions: [{ amount: 2500, transaction_type: "income" }],
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedAccount, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.updateAccount("user-123", 123, {
        name: "Updated Account",
      });

      expect(mockQuery.update).toHaveBeenCalledWith({ name: "Updated Account" });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", 123);
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual({
        id: 123,
        name: "Updated Account",
        initial_balance: 100,
        user_id: "user-123",
        created_at: mockUpdatedAccount.created_at,
        current_balance: 125, // 100 + 25
      });
    });

    it("should return null when account not found", async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.updateAccount("user-123", 999, {
        name: "Test",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
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

      const result = await accountService.deleteAccount("user-123", 123);

      expect(mockSupabase.from).toHaveBeenCalledWith("accounts");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockFirstEq).toHaveBeenCalledWith("id", 123);
      expect(mockSecondEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toBe(true);
    });

    it("should return false when account not found", async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "PGRST116", message: "Not found" },
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.deleteAccount("user-123", 999);

      expect(result).toBe(false);
    });

    it("should throw error when delete operation fails", async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "23503", message: "Foreign key violation" },
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(accountService.deleteAccount("user-123", 123)).rejects.toThrow(
        "Failed to delete account: Foreign key violation"
      );
    });
  });

  describe("balance calculation edge cases", () => {
    it("should handle accounts with no transactions", async () => {
      const mockAccountData = {
        id: 123,
        name: "Empty Account",
        initial_balance: 250,
        user_id: "user-123",
        created_at: new Date().toISOString(),
        transactions: [],
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccountData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccountById("user-123", 123);

      expect(result?.current_balance).toBe(250);
    });

    it("should handle accounts with null transactions", async () => {
      const mockAccountData = {
        id: 123,
        name: "Account with null transactions",
        initial_balance: 100,
        user_id: "user-123",
        created_at: new Date().toISOString(),
        transactions: null,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccountData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccountById("user-123", 123);

      expect(result?.current_balance).toBe(100);
    });

    it("should correctly calculate balance with mixed transaction types", async () => {
      const mockAccountData = {
        id: 123,
        name: "Mixed Transactions Account",
        initial_balance: 1000,
        user_id: "user-123",
        created_at: new Date().toISOString(),
        transactions: [
          { amount: 50000, transaction_type: "income" }, // +500
          { amount: 25000, transaction_type: "expense" }, // -250
          { amount: 30000, transaction_type: "income" }, // +300
          { amount: 10000, transaction_type: "expense" }, // -100
        ],
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAccountData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await accountService.getAccountById("user-123", 123);

      expect(result?.current_balance).toBe(1450); // 1000 + 500 - 250 + 300 - 100
    });
  });
});
