import { describe, it, expect, vi, beforeEach } from "vitest";
import { BudgetService } from "../budget.service";
import { ApiError } from "../../api/errors";
import type { SupabaseClientType } from "../../../db/supabase.client";

const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClientType;

describe("BudgetService", () => {
  let budgetService: BudgetService;

  beforeEach(() => {
    vi.clearAllMocks();
    budgetService = new BudgetService(mockSupabase);
  });

  describe("getBudgetById", () => {
    it("should return budget when found", async () => {
      const mockBudget = {
        id: 1,
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
        created_at: new Date().toISOString(),
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await budgetService.getBudgetById("user-123", 1);

      expect(mockSupabase.from).toHaveBeenCalledWith("budget");
      expect(mockQuery.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual({
        id: 1,
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
        created_at: mockBudget.created_at,
      });
    });

    it("should return null when budget not found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await budgetService.getBudgetById("user-123", 999);

      expect(result).toBeNull();
    });

    it("should throw ApiError when database error occurs", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "42P01", message: "Table not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.getBudgetById("user-123", 1)).rejects.toThrow(ApiError);
    });
  });

  describe("getBudgets", () => {
    it("should return filtered budgets for year with pagination", async () => {
      const mockBudgets = [
        {
          id: 1,
          category_id: 10,
          budget_date: "2024-01-01",
          planned_amount: 50000,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          category_id: 11,
          budget_date: "2024-02-01",
          planned_amount: 75000,
          created_at: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockBudgets, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await budgetService.getBudgets("user-123", "2024", 1, 10);

      expect(mockSupabase.from).toHaveBeenCalledWith("budget");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockQuery.gte).toHaveBeenCalledWith("budget_date", "2024-01-01");
      expect(mockQuery.lte).toHaveBeenCalledWith("budget_date", "2024-12-31");
      expect(mockQuery.order).toHaveBeenCalledWith("budget_date", { ascending: true });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ id: 1, category_id: 10 }));
    });

    it("should return empty array when no budgets found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await budgetService.getBudgets("user-123", "2025");

      expect(result).toEqual([]);
    });

    it("should cap limit at 100 records", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await budgetService.getBudgets("user-123", "2024", 1, 150);

      expect(mockQuery.range).toHaveBeenCalledWith(0, 99);
    });
  });

  describe("createBudget", () => {
    it("should create budget successfully", async () => {
      const command = {
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
      };

      const mockBudget = {
        id: 1,
        ...command,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      // Mock category validation
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 10 },
          error: null,
        }),
      };

      // Mock duplicate check
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      // Mock insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
      };

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockCategoryQuery)
        .mockReturnValueOnce(mockDuplicateQuery)
        .mockReturnValueOnce(mockInsertQuery);

      const result = await budgetService.createBudget("user-123", command);

      expect(result).toEqual({
        id: 1,
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
        created_at: mockBudget.created_at,
      });
    });

    it("should throw ApiError when category doesn't exist", async () => {
      const command = {
        category_id: 999,
        budget_date: "2024-01-01",
        planned_amount: 50000,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.createBudget("user-123", command)).rejects.toThrow(
        new ApiError(500, "Failed to validate category ownership: Not found")
      );
    });

    it("should throw ApiError when duplicate budget exists", async () => {
      const command = {
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
      };

      // Mock category validation success
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 10 },
          error: null,
        }),
      };

      // Mock duplicate found
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockCategoryQuery).mockReturnValueOnce(mockDuplicateQuery);

      await expect(budgetService.createBudget("user-123", command)).rejects.toThrow(
        new ApiError(400, "Budget for this category and date already exists")
      );
    });
  });

  describe("updateBudget", () => {
    it("should update budget successfully", async () => {
      const command = { planned_amount: 75000 };
      const mockUpdatedBudget = {
        id: 1,
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 75000,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      // Mock validation
      const mockValidationQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      // Mock update
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedBudget, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockValidationQuery).mockReturnValueOnce(mockUpdateQuery);

      const result = await budgetService.updateBudget("user-123", 1, command);

      expect(result).toEqual({
        id: 1,
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 75000,
        created_at: mockUpdatedBudget.created_at,
      });
    });

    it("should throw ApiError when budget doesn't exist", async () => {
      const command = { planned_amount: 75000 };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.updateBudget("user-123", 999, command)).rejects.toThrow(
        new ApiError(404, "Budget with ID 999 not found or does not belong to the user")
      );
    });
  });

  describe("deleteBudget", () => {
    it("should delete budget successfully", async () => {
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

      const result = await budgetService.deleteBudget("user-123", 1);

      expect(mockSupabase.from).toHaveBeenCalledWith("budget");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockFirstEq).toHaveBeenCalledWith("id", 1);
      expect(mockSecondEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toBe(true);
    });

    it("should return false when budget not found", async () => {
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

      const result = await budgetService.deleteBudget("user-123", 999);

      expect(result).toBe(false);
    });

    it("should throw ApiError when database error occurs", async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "42P01", message: "Table not found" },
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.deleteBudget("user-123", 1)).rejects.toThrow(ApiError);
    });
  });

  describe("validateCategoryOwnership (private method behavior)", () => {
    it("should validate category ownership through createBudget", async () => {
      const command = {
        category_id: 999,
        budget_date: "2024-01-01",
        planned_amount: 50000,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "42501", message: "Permission denied" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.createBudget("user-123", command)).rejects.toThrow(
        new ApiError(500, "Failed to validate category ownership: Permission denied")
      );
    });
  });

  describe("error handling edge cases", () => {
    it("should handle unexpected errors in getBudgets", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockRejectedValue(new Error("Network error")),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.getBudgets("user-123", "2024")).rejects.toThrow(
        new ApiError(500, "An unexpected error occurred while fetching budgets")
      );
    });

    it("should handle unexpected errors in createBudget", async () => {
      const command = {
        category_id: 10,
        budget_date: "2024-01-01",
        planned_amount: 50000,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error("Connection timeout")),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(budgetService.createBudget("user-123", command)).rejects.toThrow(
        new ApiError(500, "An unexpected error occurred while creating budget")
      );
    });
  });
});
