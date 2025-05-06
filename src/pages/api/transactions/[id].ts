import type { APIRoute } from "astro";
import { TransactionService } from "../../../lib/services/transaction.service";
import { handleApiError } from "../../../lib/api/errors";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { z } from "zod";

export const prerender = false;

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  category_id: z.number().optional(),
  description: z.string().optional(),
  transaction_date: z.string().datetime().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const transactionId = parseInt(params.id ?? "", 10);
    if (isNaN(transactionId)) {
      throw new ApiError(400, "Invalid transaction ID: parameter must be a number");
    }

    const transactionService = new TransactionService(locals.supabase);
    const transaction = await transactionService.getTransactionById(DEFAULT_USER_ID, transactionId);

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return new Response(JSON.stringify(transaction), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const transactionId = parseInt(params.id ?? "", 10);
    if (isNaN(transactionId)) {
      throw new ApiError(400, "Invalid transaction ID: parameter must be a number");
    }

    const json = await request.json();
    const result = updateTransactionSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + JSON.stringify(result.error.format()));
    }

    const transactionService = new TransactionService(locals.supabase);
    const transaction = await transactionService.updateTransaction(DEFAULT_USER_ID, transactionId, result.data);

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return new Response(JSON.stringify(transaction), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const transactionId = parseInt(params.id ?? "", 10);
    if (isNaN(transactionId)) {
      throw new ApiError(400, "Invalid transaction ID: parameter must be a number");
    }

    const transactionService = new TransactionService(locals.supabase);
    const success = await transactionService.deleteTransaction(DEFAULT_USER_ID, transactionId);

    if (!success) {
      throw new ApiError(404, "Transaction not found");
    }

    return new Response(JSON.stringify({ message: "Transaction deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
