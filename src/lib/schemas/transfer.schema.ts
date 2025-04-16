import { z } from "zod";
import type { Database } from "../../db/database.types";

export const transferTransactionSchema = z
  .object({
    source_account_id: z.number().int().positive("Source account ID must be a positive integer"),
    destination_account_id: z.number().int().positive("Destination account ID must be a positive integer").nullable(),
    amount: z.number().int(),
    transaction_date: z.string().datetime({ message: "Invalid date format", offset: true }),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.destination_account_id === null) return true;
      return data.source_account_id !== data.destination_account_id;
    },
    {
      message: "Source and destination accounts must be different",
    }
  );

export type TransferTransactionCommand = z.infer<typeof transferTransactionSchema>;

export interface ValidatedTransfer extends TransferTransactionCommand {
  user_id: string;
}

export interface TransferTransactionResponse {
  source_transaction: TransactionDTO;
  destination_transaction: TransactionDTO | null;
}

// Use the database types to ensure consistency
export type TransactionDTO = Database["public"]["Tables"]["transactions"]["Row"];
