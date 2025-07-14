import type { APIRoute } from "astro";
import { CategoryService } from "../../../lib/services/category.service";
import { handleApiError } from "../../../lib/api/errors";
import { createCategorySchema } from "../../../lib/schemas/category.schema";
import { ApiError } from "../../../lib/api/errors";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const categoryService = new CategoryService(locals.supabase);
    const categories = await categoryService.getCategories(locals.user.id);

    return new Response(JSON.stringify(categories), {
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
    const category = await categoryService.createCategory(locals.user.id, result.data);

    return new Response(JSON.stringify(category), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
