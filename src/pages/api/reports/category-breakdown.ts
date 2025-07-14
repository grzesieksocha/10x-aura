import type { APIRoute } from "astro";
import { handleApiError } from "../../../lib/api/errors";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse request URL with base to support relative URLs
    const base = request.headers.get("origin") ?? "http://localhost";
    const url = new URL(request.url, base);
    const month = url.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return new Response(JSON.stringify({ error: { message: "Invalid month format", code: "INVALID_MONTH" } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch expense transactions for the month
    const { data: txs, error } = await locals.supabase
      .from("transactions")
      .select("amount,categories(name)")
      .eq("user_id", locals.user.id)
      .eq("transaction_type", "expense")
      .like("transaction_date", `${month}%`);

    if (error) {
      throw error;
    }

    if (!txs) {
      throw new Error("Failed to fetch transactions");
    }

    // Group totals by category name
    const breakdownMap = txs.reduce<Record<string, number>>((acc, tx) => {
      const name = tx.categories?.name ?? "";
      acc[name] = (acc[name] || 0) + (tx.amount as number);
      return acc;
    }, {});

    const breakdown = Object.entries(breakdownMap).map(([category, total]) => ({ category, total }));

    return new Response(JSON.stringify(breakdown), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
