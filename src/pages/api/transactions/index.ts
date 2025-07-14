import type { APIRoute } from "astro";
import { TransactionService } from "../../../lib/services/transaction.service";
import { handleApiError } from "../../../lib/api/errors";
import { ApiError } from "../../../lib/api/errors";
import { z } from "zod";

export const prerender = false;

const querySchema = z.object({
  accountId: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  categoryId: z.coerce.number().optional(),
  type: z
    .string()
    .transform((val) => val.split(",") as ["expense", "revenue", "transfer"])
    .optional(),
});

const createTransactionSchema = z.object({
  account_id: z.number(),
  amount: z.number().positive(),
  category_id: z.number().optional(),
  description: z.string().optional(),
  transaction_date: z.string().datetime(),
  transaction_type: z.enum(["expense", "revenue", "transfer"]),
  related_transaction_id: z.number().optional(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const searchParams = Object.fromEntries(url.searchParams.entries());
    const result = querySchema.safeParse(searchParams);

    if (!result.success) {
      throw new ApiError(400, "Invalid query parameters: " + JSON.stringify(result.error.format()));
    }

    const transactionService = new TransactionService(locals.supabase);
    const transactions = await transactionService.listTransactions(locals.user.id, result.data);

    return new Response(JSON.stringify(transactions), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const json = await request.json();
    const result = createTransactionSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + JSON.stringify(result.error.format()));
    }

    const transactionService = new TransactionService(locals.supabase);
    const transaction = await transactionService.createTransaction(locals.user.id, result.data);

    return new Response(JSON.stringify(transaction), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
