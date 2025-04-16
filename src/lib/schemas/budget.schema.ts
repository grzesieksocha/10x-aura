import { z } from "zod";

// Base schemas
const budgetDateSchema = z.string().regex(/^\d{4}-\d{2}-01$/, "Date must be in YYYY-MM-01 format");
const plannedAmountSchema = z.number().positive("Planned amount must be positive");
const yearSchema = z.string().regex(/^\d{4}$/, "Year must be in YYYY format");

// Command schemas
export const createBudgetSchema = z.object({
  category_id: z.number().positive("Category ID must be positive"),
  budget_date: budgetDateSchema,
  planned_amount: plannedAmountSchema,
});

export const updateBudgetSchema = z.object({
  planned_amount: plannedAmountSchema,
});

export const budgetListParamsSchema = z.object({
  year: yearSchema,
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Types
export type CreateBudgetCommand = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetCommand = z.infer<typeof updateBudgetSchema>;
export type BudgetListParams = z.infer<typeof budgetListParamsSchema>;

export interface BudgetResponseDTO {
  id: number;
  category_id: number;
  budget_date: string;
  planned_amount: number;
  created_at: string;
}
