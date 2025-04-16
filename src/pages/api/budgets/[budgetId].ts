import type { APIRoute } from "astro";
import { BudgetService } from "../../../lib/services/budget.service";
import { handleApiError } from "../../../lib/api/errors";
import { updateBudgetSchema } from "../../../lib/schemas/budget.schema";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const budgetId = parseInt(params.budgetId ?? "", 10);
    if (isNaN(budgetId)) {
      throw new ApiError(400, "Invalid budget ID", "INVALID_PARAMETER");
    }

    const budgetService = new BudgetService(locals.supabase);
    const budget = await budgetService.getBudgetById(DEFAULT_USER_ID, budgetId);

    if (!budget) {
      throw new ApiError(404, "Budget not found", "NOT_FOUND");
    }

    return new Response(JSON.stringify(budget), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const budgetId = parseInt(params.budgetId ?? "", 10);
    if (isNaN(budgetId)) {
      throw new ApiError(400, "Invalid budget ID", "INVALID_PARAMETER");
    }

    const json = await request.json();
    const result = updateBudgetSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + result.error.message, "VALIDATION_ERROR");
    }

    const budgetService = new BudgetService(locals.supabase);
    const budget = await budgetService.updateBudget(DEFAULT_USER_ID, budgetId, result.data);

    return new Response(JSON.stringify(budget), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const budgetId = parseInt(params.budgetId ?? "", 10);
    if (isNaN(budgetId)) {
      throw new ApiError(400, "Invalid budget ID", "INVALID_PARAMETER");
    }

    const budgetService = new BudgetService(locals.supabase);
    const success = await budgetService.deleteBudget(DEFAULT_USER_ID, budgetId);

    if (!success) {
      throw new ApiError(404, "Budget not found", "NOT_FOUND");
    }

    return new Response(JSON.stringify({ message: "Budget deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
