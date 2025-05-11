import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CategoryViewModel } from "@/types";

interface CategoryItemProps {
  category: CategoryViewModel;
  onEdit: (category: CategoryViewModel) => void;
  onDelete: (category: CategoryViewModel) => void;
}

export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const { name, is_revenue } = category;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground">{is_revenue ? "Revenue" : "Expense"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} className="text-xs h-8">
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)} className="text-xs h-8 text-destructive">
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
