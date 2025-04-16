import type { CategoryResponseDTO, CreateCategoryCommand, UpdateCategoryCommand } from "../schemas/category.schema";
import type { SupabaseClientType } from "../../db/supabase.client";
import { ApiError } from "../api/errors";

export class CategoryService {
  constructor(private readonly supabase: SupabaseClientType) {}

  async createCategory(userId: string, command: CreateCategoryCommand): Promise<CategoryResponseDTO> {
    const { data: existingCategory } = await this.supabase
      .from("categories")
      .select()
      .eq("user_id", userId)
      .eq("name", command.name)
      .maybeSingle();

    if (existingCategory) {
      throw new ApiError(400, "Category with this name already exists", "DUPLICATE_NAME");
    }

    const { data: category, error } = await this.supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: command.name,
        is_revenue: command.is_revenue,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return category;
  }

  async getCategories(userId: string): Promise<CategoryResponseDTO[]> {
    const { data: categories, error } = await this.supabase
      .from("categories")
      .select()
      .eq("user_id", userId)
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return categories;
  }

  async getCategoryById(userId: string, categoryId: number): Promise<CategoryResponseDTO | null> {
    const { data: category, error } = await this.supabase
      .from("categories")
      .select()
      .eq("id", categoryId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return category;
  }

  async updateCategory(
    userId: string,
    categoryId: number,
    command: UpdateCategoryCommand
  ): Promise<CategoryResponseDTO | null> {
    // Check if category exists
    const existingCategory = await this.getCategoryById(userId, categoryId);
    if (!existingCategory) {
      return null;
    }

    // Check if new name is already taken by another category
    const { data: duplicateCategory } = await this.supabase
      .from("categories")
      .select()
      .eq("user_id", userId)
      .eq("name", command.name)
      .neq("id", categoryId)
      .maybeSingle();

    if (duplicateCategory) {
      throw new ApiError(400, "Category with this name already exists", "DUPLICATE_NAME");
    }

    const { data: category, error } = await this.supabase
      .from("categories")
      .update({ name: command.name })
      .eq("id", categoryId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return category;
  }

  async deleteCategory(userId: string, categoryId: number): Promise<boolean> {
    // Check if category is used in any transactions
    const { data: transactions } = await this.supabase
      .from("transactions")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new ApiError(400, "Cannot delete category that is used in transactions", "CATEGORY_IN_USE");
    }

    // Check if category is used in any budget entries
    const { data: budgetEntries } = await this.supabase
      .from("budget")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1);

    if (budgetEntries && budgetEntries.length > 0) {
      throw new ApiError(400, "Cannot delete category that is used in budget entries", "CATEGORY_IN_USE");
    }

    const { error } = await this.supabase.from("categories").delete().eq("id", categoryId).eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") return false; // Not found
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return true;
  }
}
