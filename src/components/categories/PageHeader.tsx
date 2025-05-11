import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  onAddClick: () => void;
}

export function PageHeader({ onAddClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage expense and revenue categories</p>
      </div>
      <Button onClick={onAddClick} className="flex items-center gap-1">
        <span>+</span>
        <span>Add category</span>
      </Button>
    </div>
  );
}
