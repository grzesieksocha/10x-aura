import { z } from "zod";
import type { Database } from "../../db/database.types";

export const transactionQuerySchema = z.object({
  accountId: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  categoryId: z.coerce.number().optional(),
  type: z
    .string()
    .transform((val) => val.split(",") as ["expense", "revenue", "transfer"])
    .optional(),
});

export const createTransactionSchema = z.object({
  account_id: z.number(),
  amount: z.number().positive(),
  category_id: z.number().optional(),
  description: z.string().optional(),
  transaction_date: z.string().datetime(),
  transaction_type: z.enum(["expense", "revenue", "transfer"]),
  related_transaction_id: z.number().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  category_id: z.number().optional(),
  description: z.string().optional(),
  transaction_date: z.string().datetime().optional(),
  transaction_type: z.enum(["expense", "revenue", "transfer"]).optional(),
});

export const transactionFormSchema = z.object({
  type: z.enum(["expense", "revenue", "transfer"]),
  amount: z.number().positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  destinationAccountId: z.number().optional(),
});

export type TransactionQueryParams = z.infer<typeof transactionQuerySchema>;
export type CreateTransactionCommand = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionCommand = z.infer<typeof updateTransactionSchema>;
export type TransactionFormData = z.infer<typeof transactionFormSchema>;

// Use the database types to ensure consistency
export type TransactionDTO = Database["public"]["Tables"]["transactions"]["Row"];
