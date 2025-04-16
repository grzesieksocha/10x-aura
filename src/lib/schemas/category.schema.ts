import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255, "Category name is too long"),
  is_revenue: z.boolean(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255, "Category name is too long"),
});

export type CreateCategoryCommand = z.infer<typeof createCategorySchema>;
export type UpdateCategoryCommand = z.infer<typeof updateCategorySchema>;

export interface CategoryResponseDTO {
  id: number;
  user_id: string;
  name: string;
  is_revenue: boolean;
  created_at: string;
}
