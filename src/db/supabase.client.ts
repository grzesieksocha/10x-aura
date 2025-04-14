import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClientType = typeof supabaseClient;

export const DEFAULT_USER_ID = "2adeb8b4-3c9c-44bc-96b8-43ab1ddbddd1";
