import type { APIRoute } from "astro";
import { BudgetService } from "../../../lib/services/budget.service";
import { handleApiError } from "../../../lib/api/errors";
import { createBudgetSchema, budgetListParamsSchema } from "../../../lib/schemas/budget.schema";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const year = url.searchParams.get("year");
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const params = {
      year: year || new Date().getFullYear().toString(),
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const result = budgetListParamsSchema.safeParse(params);
    if (!result.success) {
      throw new ApiError(400, "Invalid query parameters", "VALIDATION_ERROR");
    }

    const budgetService = new BudgetService(locals.supabase);
    const budgets = await budgetService.getBudgets(
      DEFAULT_USER_ID,
      result.data.year,
      result.data.page,
      result.data.limit
    );

    return new Response(JSON.stringify(budgets), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const json = await request.json();
    const result = createBudgetSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }

    const budgetService = new BudgetService(locals.supabase);
    const budget = await budgetService.createBudget(DEFAULT_USER_ID, result.data);

    return new Response(JSON.stringify(budget), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
