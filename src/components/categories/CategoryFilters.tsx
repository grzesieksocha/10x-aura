import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CategoryFilter } from "@/types";

interface CategoryFiltersProps {
  filters: CategoryFilter;
  onFiltersChange: (filters: CategoryFilter) => void;
}

export function CategoryFilters({ filters, onFiltersChange }: CategoryFiltersProps) {
  const setTypeFilter = (type: "all" | "expense" | "revenue") => {
    onFiltersChange({ ...filters, type });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.type === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
          className="min-w-20"
        >
          All
        </Button>
        <Button
          variant={filters.type === "expense" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("expense")}
          className="min-w-20"
        >
          Expenses
        </Button>
        <Button
          variant={filters.type === "revenue" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("revenue")}
          className="min-w-20"
        >
          Revenue
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search categories..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="pr-10"
        />
        {filters.search && (
          <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-0 top-0 h-full px-3">
            ×
          </Button>
        )}
      </div>
    </div>
  );
}
