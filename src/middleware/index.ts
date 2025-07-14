import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/reset-password-confirm",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Make supabase available in Astro.locals
  locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Get user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated
    locals.user = user;
    return next();
  } else {
    // User is not authenticated, redirect to login
    console.log("Auth check failed for", url.pathname, "- Error:", error?.message || "No user");
    return redirect("/login");
  }
});
