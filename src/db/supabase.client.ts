import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { AstroCookies } from "astro";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Client-side Supabase client (for React components)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClientType = typeof supabaseClient;

// Server-side Supabase client configuration
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

export const DEFAULT_USER_ID = "2adeb8b4-3c9c-44bc-96b8-43ab1ddbddd1";
