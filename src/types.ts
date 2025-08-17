import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { AccountResponseDTO } from "src/lib/schemas/account.schema";

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: { id: string; email: string } | null;
  }
}

export type DashboardAccount = AccountResponseDTO;

export type TotalBalance = number;

export interface CategoryBreakdownDTO {
  category: string;
  total: number;
}

export interface CategoryResponseDTO {
  id: number;
  user_id: string;
  name: string;
  is_revenue: boolean;
  created_at: string;
}

export interface CategoryViewModel {
  id: number;
  name: string;
  is_revenue: boolean;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  is_revenue: boolean;
}

export interface CategoryFilter {
  type: "all" | "expense" | "revenue";
  search?: string;
}
