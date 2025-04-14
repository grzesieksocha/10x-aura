import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: User | null;
  }
}
