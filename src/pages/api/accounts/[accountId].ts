import type { APIRoute } from "astro";
import { AccountService } from "../../../lib/services/account.service";
import { TransactionService } from "../../../lib/services/transaction.service";
import { handleApiError } from "../../../lib/api/errors";
import { updateAccountSchema } from "../../../lib/schemas/account.schema";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const accountId = Number(params.accountId);
    if (isNaN(accountId)) {
      return new Response(JSON.stringify({ error: "Invalid account ID" }), { status: 400 });
    }

    const transactionService = new TransactionService(locals.supabase);
    const accountService = new AccountService(locals.supabase, transactionService);
    const account = await accountService.getAccountById(DEFAULT_USER_ID, accountId);

    if (!account) {
      return new Response(JSON.stringify({ error: "Account not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(account));
  } catch (error) {
    return handleApiError(error);
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const accountId = Number(params.accountId);
    if (isNaN(accountId)) {
      return new Response(JSON.stringify({ error: "Invalid account ID" }), { status: 400 });
    }

    const json = await request.json();
    const result = updateAccountSchema.safeParse(json);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    const transactionService = new TransactionService(locals.supabase);
    const accountService = new AccountService(locals.supabase, transactionService);
    const account = await accountService.updateAccount(DEFAULT_USER_ID, accountId, result.data);

    if (!account) {
      return new Response(JSON.stringify({ error: "Account not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(account));
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const accountId = Number(params.accountId);
    if (isNaN(accountId)) {
      return new Response(JSON.stringify({ error: "Invalid account ID" }), { status: 400 });
    }

    const transactionService = new TransactionService(locals.supabase);
    const accountService = new AccountService(locals.supabase, transactionService);
    const success = await accountService.deleteAccount(DEFAULT_USER_ID, accountId);

    if (!success) {
      return new Response(JSON.stringify({ error: "Account not found" }), { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
};
