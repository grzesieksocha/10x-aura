import type { APIRoute } from "astro";
import { AccountService } from "../../../lib/services/account.service";
import { handleApiError } from "../../../lib/api/errors";
import { updateAccountSchema } from "../../../lib/schemas/account.schema";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const accountId = parseInt(params.accountId ?? "", 10);
    if (isNaN(accountId)) {
      throw new ApiError(400, "Invalid account ID", "INVALID_PARAMETER");
    }

    const accountService = new AccountService(locals.supabase);
    const account = await accountService.getAccountById(DEFAULT_USER_ID, accountId);

    if (!account) {
      throw new ApiError(404, "Account not found", "NOT_FOUND");
    }

    return new Response(JSON.stringify(account), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const accountId = parseInt(params.accountId ?? "", 10);
    if (isNaN(accountId)) {
      throw new ApiError(400, "Invalid account ID", "INVALID_PARAMETER");
    }

    const json = await request.json();
    const result = updateAccountSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }

    const accountService = new AccountService(locals.supabase);
    const account = await accountService.updateAccount(DEFAULT_USER_ID, accountId, result.data);

    if (!account) {
      throw new ApiError(404, "Account not found", "NOT_FOUND");
    }

    return new Response(JSON.stringify(account), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const accountId = parseInt(params.accountId ?? "", 10);
    if (isNaN(accountId)) {
      throw new ApiError(400, "Invalid account ID", "INVALID_PARAMETER");
    }

    const accountService = new AccountService(locals.supabase);
    const success = await accountService.deleteAccount(DEFAULT_USER_ID, accountId);

    if (!success) {
      throw new ApiError(404, "Account not found", "NOT_FOUND");
    }

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
