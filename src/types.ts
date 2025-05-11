import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { AccountResponseDTO } from "src/lib/schemas/account.schema";

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: User | null;
  }
}

/** Konto z API */
export type DashboardAccount = AccountResponseDTO;

/** Sumaryczne saldo obliczane w hooku */
export type TotalBalance = number;

/** Podział wydatków wg kategorii */
export interface CategoryBreakdownDTO {
  category: string;
  total: number;
}
