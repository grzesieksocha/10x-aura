import type { APIRoute } from "astro";
import { TransactionService } from "../../../lib/services/transaction.service";
import { transferTransactionSchema } from "../../../lib/schemas/transfer.schema";
import { handleApiError } from "../../../lib/api/errors";
import { ApiError } from "../../../lib/api/errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

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
      user_id: locals.user.id,
    });

    return new Response(JSON.stringify(transfer), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
