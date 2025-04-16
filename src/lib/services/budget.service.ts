import type { SupabaseClientType } from "../../db/supabase.client";
import type { BudgetResponseDTO, CreateBudgetCommand, UpdateBudgetCommand } from "../schemas/budget.schema";
import { ApiError } from "../api/errors";

export class BudgetService {
  constructor(private readonly supabase: SupabaseClientType) {}

  private async validateCategoryOwnership(userId: string, categoryId: number): Promise<void> {
    const { data: category, error } = await this.supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new ApiError(500, `Failed to validate category ownership: ${error.message}`);
    }

    if (!category) {
      throw new ApiError(404, `Category with ID ${categoryId} not found or does not belong to the user`);
    }
  }

  private async validateBudgetOwnership(userId: string, budgetId: number): Promise<void> {
    const { data: budget, error } = await this.supabase
      .from("budget")
      .select("id")
      .eq("id", budgetId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new ApiError(500, `Failed to validate budget ownership: ${error.message}`);
    }

    if (!budget) {
      throw new ApiError(404, `Budget with ID ${budgetId} not found or does not belong to the user`);
    }
  }

  async getBudgetById(userId: string, budgetId: number): Promise<BudgetResponseDTO | null> {
    try {
      const { data: budget, error } = await this.supabase
        .from("budget")
        .select("*")
        .eq("id", budgetId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new ApiError(500, `Failed to fetch budget: ${error.message}`);
      }

      if (!budget) return null;

      return {
        id: budget.id,
        category_id: budget.category_id,
        budget_date: budget.budget_date,
        planned_amount: budget.planned_amount,
        created_at: budget.created_at,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while fetching budget");
    }
  }

  async getBudgets(userId: string, year: string, page?: number, limit?: number): Promise<BudgetResponseDTO[]> {
    try {
      const pageSize = Math.min(limit || 20, 100); // Cap at 100 records
      const offset = page ? (page - 1) * pageSize : 0;

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: budgets, error } = await this.supabase
        .from("budget")
        .select("*")
        .eq("user_id", userId)
        .gte("budget_date", startDate)
        .lte("budget_date", endDate)
        .order("budget_date", { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw new ApiError(500, `Failed to fetch budgets: ${error.message}`);
      }

      if (!budgets) {
        return [];
      }

      return budgets.map((budget) => ({
        id: budget.id,
        category_id: budget.category_id,
        budget_date: budget.budget_date,
        planned_amount: budget.planned_amount,
        created_at: budget.created_at,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while fetching budgets");
    }
  }

  async createBudget(userId: string, command: CreateBudgetCommand): Promise<BudgetResponseDTO> {
    try {
      // Validate category ownership
      await this.validateCategoryOwnership(userId, command.category_id);

      // Check for duplicate budget entry
      const { data: existingBudget, error: checkError } = await this.supabase
        .from("budget")
        .select("id")
        .eq("user_id", userId)
        .eq("category_id", command.category_id)
        .eq("budget_date", command.budget_date)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new ApiError(500, `Failed to check for existing budget: ${checkError.message}`);
      }

      if (existingBudget) {
        throw new ApiError(400, "Budget for this category and date already exists");
      }

      const { data: budget, error } = await this.supabase
        .from("budget")
        .insert({
          user_id: userId,
          category_id: command.category_id,
          budget_date: command.budget_date,
          planned_amount: command.planned_amount,
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(500, `Failed to create budget: ${error.message}`);
      }

      if (!budget) {
        throw new ApiError(500, "Failed to create budget: No data returned");
      }

      return {
        id: budget.id,
        category_id: budget.category_id,
        budget_date: budget.budget_date,
        planned_amount: budget.planned_amount,
        created_at: budget.created_at,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while creating budget");
    }
  }

  async updateBudget(userId: string, budgetId: number, command: UpdateBudgetCommand): Promise<BudgetResponseDTO> {
    try {
      // Validate budget ownership
      await this.validateBudgetOwnership(userId, budgetId);

      const { data: budget, error } = await this.supabase
        .from("budget")
        .update({ planned_amount: command.planned_amount })
        .eq("id", budgetId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw new ApiError(500, `Failed to update budget: ${error.message}`);
      }

      if (!budget) {
        throw new ApiError(404, "Budget not found");
      }

      return {
        id: budget.id,
        category_id: budget.category_id,
        budget_date: budget.budget_date,
        planned_amount: budget.planned_amount,
        created_at: budget.created_at,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while updating budget");
    }
  }

  async deleteBudget(userId: string, budgetId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("budget").delete().eq("id", budgetId).eq("user_id", userId);

      if (error) {
        if (error.code === "PGRST116") return false;
        throw new ApiError(500, `Failed to delete budget: ${error.message}`);
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while deleting budget");
    }
  }
}
