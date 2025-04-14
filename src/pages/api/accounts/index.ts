import type { APIRoute } from "astro";
import { AccountService } from "../../../lib/services/account.service";
import { handleApiError } from "../../../lib/api/errors";
import { createAccountSchema } from "../../../lib/schemas/account.schema";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const accountService = new AccountService(locals.supabase);
    const accounts = await accountService.getAccounts(DEFAULT_USER_ID);

    return new Response(JSON.stringify(accounts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const json = await request.json();
    const result = createAccountSchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }

    const accountService = new AccountService(locals.supabase);
    const account = await accountService.createAccount(DEFAULT_USER_ID, result.data);

    return new Response(JSON.stringify(account), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
