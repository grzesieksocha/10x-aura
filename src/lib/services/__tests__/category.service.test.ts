import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "../category.service";
import { ApiError } from "../../api/errors";
import type { SupabaseClientType } from "../../../db/supabase.client";

const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClientType;

describe("CategoryService", () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    vi.clearAllMocks();
    categoryService = new CategoryService(mockSupabase);
  });

  describe("createCategory", () => {
    it("should create category successfully", async () => {
      const command = {
        name: "Food & Dining",
        is_revenue: false,
      };

      const mockCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      // Mock duplicate check
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockDuplicateQuery).mockReturnValueOnce(mockInsertQuery);

      const result = await categoryService.createCategory("user-123", command);

      expect(mockSupabase.from).toHaveBeenCalledWith("categories");
      expect(mockDuplicateQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockDuplicateQuery.eq).toHaveBeenCalledWith("name", "Food & Dining");
      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        name: "Food & Dining",
        is_revenue: false,
      });
      expect(result).toEqual(mockCategory);
    });

    it("should throw ApiError when category name already exists", async () => {
      const command = {
        name: "Food & Dining",
        is_revenue: false,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 1, name: "Food & Dining" },
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(categoryService.createCategory("user-123", command)).rejects.toThrow(
        new ApiError(400, "Category with this name already exists", "DUPLICATE_NAME")
      );
    });

    it("should throw error when database insert fails", async () => {
      const command = {
        name: "Food & Dining",
        is_revenue: false,
      };

      // Mock duplicate check success
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock insert failure
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database constraint violation" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockDuplicateQuery).mockReturnValueOnce(mockInsertQuery);

      await expect(categoryService.createCategory("user-123", command)).rejects.toThrow(
        "Failed to create category: Database constraint violation"
      );
    });
  });

  describe("getCategories", () => {
    it("should return all categories for user ordered by name", async () => {
      const mockCategories = [
        {
          id: 1,
          name: "Entertainment",
          is_revenue: false,
          user_id: "user-123",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Food & Dining",
          is_revenue: false,
          user_id: "user-123",
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Salary",
          is_revenue: true,
          user_id: "user-123",
          created_at: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await categoryService.getCategories("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("categories");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockQuery.order).toHaveBeenCalledWith("name");
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no categories found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await categoryService.getCategories("user-123");

      expect(result).toEqual([]);
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

      await expect(categoryService.getCategories("user-123")).rejects.toThrow(
        "Failed to fetch categories: Connection timeout"
      );
    });
  });

  describe("getCategoryById", () => {
    it("should return category when found", async () => {
      const mockCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await categoryService.getCategoryById("user-123", 1);

      expect(mockSupabase.from).toHaveBeenCalledWith("categories");
      expect(mockQuery.eq).toHaveBeenCalledWith("id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual(mockCategory);
    });

    it("should return null when category not found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      const result = await categoryService.getCategoryById("user-123", 999);

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

      await expect(categoryService.getCategoryById("user-123", 1)).rejects.toThrow(
        "Failed to fetch category: Table not found"
      );
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const command = { name: "Groceries" };
      const existingCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };
      const updatedCategory = { ...existingCategory, name: "Groceries" };

      // Mock getCategoryById
      vi.spyOn(categoryService, "getCategoryById").mockResolvedValue(existingCategory);

      // Mock duplicate check
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock update
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedCategory, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockDuplicateQuery).mockReturnValueOnce(mockUpdateQuery);

      const result = await categoryService.updateCategory("user-123", 1, command);

      expect(mockDuplicateQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockDuplicateQuery.eq).toHaveBeenCalledWith("name", "Groceries");
      expect(mockDuplicateQuery.neq).toHaveBeenCalledWith("id", 1);
      expect(mockUpdateQuery.update).toHaveBeenCalledWith({ name: "Groceries" });
      expect(result).toEqual(updatedCategory);
    });

    it("should return null when category doesn't exist", async () => {
      vi.spyOn(categoryService, "getCategoryById").mockResolvedValue(null);

      const result = await categoryService.updateCategory("user-123", 999, { name: "Test" });

      expect(result).toBeNull();
    });

    it("should throw ApiError when new name already exists", async () => {
      const command = { name: "Entertainment" };
      const existingCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      vi.spyOn(categoryService, "getCategoryById").mockResolvedValue(existingCategory);

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 2, name: "Entertainment" },
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(categoryService.updateCategory("user-123", 1, command)).rejects.toThrow(
        new ApiError(400, "Category with this name already exists", "DUPLICATE_NAME")
      );
    });

    it("should throw error when update fails", async () => {
      const command = { name: "Groceries" };
      const existingCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      vi.spyOn(categoryService, "getCategoryById").mockResolvedValue(existingCategory);

      // Mock duplicate check success
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock update failure
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Update failed" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockDuplicateQuery).mockReturnValueOnce(mockUpdateQuery);

      await expect(categoryService.updateCategory("user-123", 1, command)).rejects.toThrow(
        "Failed to update category: Update failed"
      );
    });
  });

  describe("deleteCategory", () => {
    it("should delete category successfully when not in use", async () => {
      // Mock check for transactions
      const mockTransactionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock check for budget entries
      const mockBudgetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock delete
      const mockFirstDeleteEq = vi.fn().mockReturnThis();
      const mockSecondDeleteEq = vi.fn().mockResolvedValue({ error: null });
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: mockFirstDeleteEq,
      };

      mockFirstDeleteEq.mockReturnValue({
        eq: mockSecondDeleteEq,
      });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockTransactionQuery)
        .mockReturnValueOnce(mockBudgetQuery)
        .mockReturnValueOnce(mockDeleteQuery);

      const result = await categoryService.deleteCategory("user-123", 1);

      expect(mockTransactionQuery.eq).toHaveBeenCalledWith("category_id", 1);
      expect(mockBudgetQuery.eq).toHaveBeenCalledWith("category_id", 1);
      expect(mockFirstDeleteEq).toHaveBeenCalledWith("id", 1);
      expect(mockSecondDeleteEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toBe(true);
    });

    it("should throw ApiError when category is used in transactions", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ id: 1 }],
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery);

      await expect(categoryService.deleteCategory("user-123", 1)).rejects.toThrow(
        new ApiError(400, "Cannot delete category that is used in transactions", "CATEGORY_IN_USE")
      );
    });

    it("should throw ApiError when category is used in budget entries", async () => {
      // Mock check for transactions - empty
      const mockTransactionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock check for budget entries - has entries
      const mockBudgetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ id: 1 }],
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockTransactionQuery).mockReturnValueOnce(mockBudgetQuery);

      await expect(categoryService.deleteCategory("user-123", 1)).rejects.toThrow(
        new ApiError(400, "Cannot delete category that is used in budget entries", "CATEGORY_IN_USE")
      );
    });

    it("should return false when category not found", async () => {
      // Mock check for transactions
      const mockTransactionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock check for budget entries
      const mockBudgetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock delete - not found
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockDeleteQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "PGRST116", message: "Not found" },
        }),
      });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockTransactionQuery)
        .mockReturnValueOnce(mockBudgetQuery)
        .mockReturnValueOnce(mockDeleteQuery);

      const result = await categoryService.deleteCategory("user-123", 999);

      expect(result).toBe(false);
    });

    it("should throw error when delete operation fails", async () => {
      // Mock check for transactions
      const mockTransactionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock check for budget entries
      const mockBudgetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock delete failure
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockDeleteQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "42501", message: "Permission denied" },
        }),
      });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockTransactionQuery)
        .mockReturnValueOnce(mockBudgetQuery)
        .mockReturnValueOnce(mockDeleteQuery);

      await expect(categoryService.deleteCategory("user-123", 1)).rejects.toThrow(
        "Failed to delete category: Permission denied"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle null data from maybeSingle", async () => {
      const command = {
        name: "Food & Dining",
        is_revenue: false,
      };

      const mockCategory = {
        id: 1,
        name: "Food & Dining",
        is_revenue: false,
        user_id: "user-123",
        created_at: new Date().toISOString(),
      };

      // Mock duplicate check with null data
      const mockDuplicateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockDuplicateQuery).mockReturnValueOnce(mockInsertQuery);

      const result = await categoryService.createCategory("user-123", command);

      expect(result).toEqual(mockCategory);
    });

    it("should handle empty name in category creation", async () => {
      const command = {
        name: "",
        is_revenue: false,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Name cannot be empty" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockQuery).mockReturnValueOnce(mockInsertQuery);

      await expect(categoryService.createCategory("user-123", command)).rejects.toThrow(
        "Failed to create category: Name cannot be empty"
      );
    });
  });
});
