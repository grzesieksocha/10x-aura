import type { APIRoute } from "astro";
import { AccountService } from "../../../lib/services/account.service";
import { TransactionService } from "../../../lib/services/transaction.service";
import { handleApiError } from "../../../lib/api/errors";
import { createAccountSchema } from "../../../lib/schemas/account.schema";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const transactionService = new TransactionService(locals.supabase);
    const accountService = new AccountService(locals.supabase, transactionService);
    const accounts = await accountService.getAccounts(DEFAULT_USER_ID);

    return new Response(JSON.stringify(accounts));
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const json = await request.json();
    const result = createAccountSchema.safeParse(json);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    const transactionService = new TransactionService(locals.supabase);
    const accountService = new AccountService(locals.supabase, transactionService);
    const account = await accountService.createAccount(DEFAULT_USER_ID, result.data);

    return new Response(JSON.stringify(account), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
