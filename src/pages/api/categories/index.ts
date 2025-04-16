import type { APIRoute } from "astro";
import { CategoryService } from "../../../lib/services/category.service";
import { handleApiError } from "../../../lib/api/errors";
import { createCategorySchema } from "../../../lib/schemas/category.schema";
import { ApiError } from "../../../lib/api/errors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const categoryService = new CategoryService(locals.supabase);
    const categories = await categoryService.getCategories(DEFAULT_USER_ID);

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let json;
    try {
      json = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON payload");
    }

    const result = createCategorySchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + JSON.stringify(result.error.format()));
    }

    const categoryService = new CategoryService(locals.supabase);
    const category = await categoryService.createCategory(DEFAULT_USER_ID, result.data);

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
