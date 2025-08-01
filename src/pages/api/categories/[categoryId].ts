import type { APIRoute } from "astro";
import { CategoryService } from "../../../lib/services/category.service";
import { handleApiError } from "../../../lib/api/errors";
import { updateCategorySchema } from "../../../lib/schemas/category.schema";
import { ApiError } from "../../../lib/api/errors";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const categoryId = parseInt(params.categoryId ?? "", 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, "Invalid category ID: parameter must be a number");
    }

    const categoryService = new CategoryService(locals.supabase);
    const category = await categoryService.getCategoryById(locals.user.id, categoryId);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return new Response(JSON.stringify(category), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const categoryId = parseInt(params.categoryId ?? "", 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, "Invalid category ID: parameter must be a number");
    }

    const json = await request.json();
    const result = updateCategorySchema.safeParse(json);

    if (!result.success) {
      throw new ApiError(400, "Invalid request data: " + JSON.stringify(result.error.format()));
    }

    const categoryService = new CategoryService(locals.supabase);
    const category = await categoryService.updateCategory(locals.user.id, categoryId, result.data);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return new Response(JSON.stringify(category), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const categoryId = parseInt(params.categoryId ?? "", 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, "Invalid category ID: parameter must be a number");
    }

    const categoryService = new CategoryService(locals.supabase);
    const success = await categoryService.deleteCategory(locals.user.id, categoryId);

    if (!success) {
      throw new ApiError(404, "Category not found");
    }

    return new Response(JSON.stringify({ message: "Category deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
