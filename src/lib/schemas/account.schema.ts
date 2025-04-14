import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  initial_balance: z.number().min(0, "Initial balance must be non-negative"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
});

export type CreateAccountCommand = z.infer<typeof createAccountSchema>;
export type UpdateAccountCommand = z.infer<typeof updateAccountSchema>;

export interface AccountResponseDTO {
  id: number;
  user_id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
}
