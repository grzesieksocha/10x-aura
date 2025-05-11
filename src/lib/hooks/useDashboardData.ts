import { useState, useEffect } from "react";
import type { DashboardAccount, CategoryBreakdownDTO, TotalBalance } from "src/types";

export function useDashboardData(selectedMonth?: string) {
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState<TotalBalance>(0);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const accountsRes = await fetch("/api/accounts");
        const accountsJson = await accountsRes.json();
        // Determine month to fetch breakdown for
        // const month = selectedMonth ?? new Date().toISOString().slice(0, 7);
        // const breakdownRes = await fetch(`/api/reports/category-breakdown?month=${month}`);
        // const breakdownJson = await breakdownRes.json();

        // if ("error" in breakdownJson) throw new Error(breakdownJson.error.message);

        // MOCK: przykładowe dane breakdown
        const breakdownMock: CategoryBreakdownDTO[] = [
          { category: "Food", total: 250 },
          { category: "Transport", total: 120 },
          { category: "Entertainment", total: 80 },
        ];

        if ("error" in accountsJson) throw new Error(accountsJson.error.message);
        // if ("error" in breakdownJson) throw new Error(breakdownJson.error.message);

        setAccounts(accountsJson as DashboardAccount[]);
        const total = (accountsJson as DashboardAccount[]).reduce((sum, acc) => sum + acc.current_balance, 0);
        setTotalBalance(total);
        setBreakdown(breakdownMock);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth]);

  return { accounts, totalBalance, breakdown, loading, error };
}
