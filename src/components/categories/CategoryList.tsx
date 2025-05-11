import { CategoryItem } from "@/components/categories/CategoryItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryViewModel } from "@/types";

interface CategoryListProps {
  categories: CategoryViewModel[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (category: CategoryViewModel) => void;
  onDelete: (category: CategoryViewModel) => void;
  onRetry?: () => void;
}

export function CategoryList({ categories, isLoading, error, onEdit, onDelete, onRetry }: CategoryListProps) {
  const expenseCategories = categories.filter((cat) => !cat.is_revenue);
  const revenueCategories = categories.filter((cat) => cat.is_revenue);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive font-medium mb-2">Error loading categories</p>
        <p className="text-sm text-destructive/80 mb-4">{error.message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center">
        <p className="text-muted-foreground mb-2">You don&apos;t have any categories yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
        {expenseCategories.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">You don&apos;t have any expense categories yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <CategoryItem key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Revenue Categories</h2>
        {revenueCategories.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">You don&apos;t have any revenue categories yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {revenueCategories.map((category) => (
              <CategoryItem key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
