import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountService } from "../account.service";
import { TransactionService } from "../transaction.service";
import type { SupabaseClientType } from "../../../db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClientType;

// Mock TransactionService
const mockTransactionService = {
  createTransfer: vi.fn(),
  getAccountBalance: vi.fn(),
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
        id: "123",
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
      expect(result).toEqual({
        ...mockAccount,
        current_balance: 0,
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

      expect(result).toEqual({
        id: 123,
        name: "Test Account",
        initial_balance: 100,
        user_id: "user-123",
        created_at: mockAccountData.created_at,
        current_balance: 130, // 100 + 50 - 20
      });
    });
  });
});
