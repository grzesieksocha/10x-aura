import { useCallback, useEffect, useState } from "react";
import type { Tables } from "@/db/database.types";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: number;
  type?: Tables<"transactions">["transaction_type"][];
}

export function useTransactions(accountId: number) {
  const [transactions, setTransactions] = useState<Tables<"transactions">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.set("accountId", String(accountId));

      if (filters.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.set("dateTo", filters.dateTo);
      if (filters.categoryId) queryParams.set("categoryId", String(filters.categoryId));
      if (filters.type?.length) queryParams.set("type", filters.type.join(","));

      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [accountId, filters]);

  // Fetch transactions when accountId or filters change
  useEffect(() => {
    fetchTransactions();
  }, [accountId, filters, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchTransactions, // Expose refresh function
  };
}
