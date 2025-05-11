import React from "react";
import { useDashboardData } from "src/lib/hooks/useDashboardData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AccountsSection from "@/components/dashboard/AccountsSection";
import CategoryBreakdownSection from "@/components/dashboard/CategoryBreakdownSection";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const DashboardPage: React.FC = () => {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const selectedMonth = `${year}-${month.toString().padStart(2, "0")}`;
  const { accounts, totalBalance, breakdown, loading, error } = useDashboardData(selectedMonth);

  if (loading) {
    return <div>Ładowanie...</div>;
  }
  if (error) {
    return <div className="text-red-500">Błąd: {error.message}</div>;
  }

  // Generate year and month options
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <ErrorBoundary>
      <div className="space-y-8 p-4">
        <DashboardHeader totalBalance={totalBalance} />
        <AccountsSection accounts={accounts} />
        <div className="flex flex-wrap items-end gap-4 mb-2">
          <div>
            <label htmlFor="year-select" className="block text-sm font-medium mb-1">
              Rok
            </label>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger id="year-select" className="w-24">
                <SelectValue placeholder="Rok" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="month-select" className="block text-sm font-medium mb-1">
              Miesiąc
            </label>
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger id="month-select" className="w-32">
                <SelectValue placeholder="Miesiąc" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CategoryBreakdownSection data={breakdown} />
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
