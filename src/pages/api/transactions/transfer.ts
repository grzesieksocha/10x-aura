import type { APIRoute } from "astro";
import { TransactionService } from "../../../lib/services/transaction.service";
import { transferTransactionSchema } from "../../../lib/schemas/transfer.schema";
import { handleApiError } from "../../../lib/api/errors";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let json;
    try {
      json = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON payload");
    }

    const result = transferTransactionSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + JSON.stringify(result.error.format()));
    }

    const transactionService = new TransactionService(locals.supabase);
    const transfer = await transactionService.createTransfer({
      ...result.data,
      user_id: DEFAULT_USER_ID,
    });

    return new Response(JSON.stringify(transfer), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
