import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryFormData } from "@/types";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialValues?: Partial<CategoryFormData>;
  isEditing: boolean;
}

export function CategoryFormModal({ isOpen, onClose, onSubmit, initialValues, isEditing }: CategoryFormModalProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [isRevenue, setIsRevenue] = useState<boolean>(
    initialValues?.is_revenue !== undefined ? initialValues.is_revenue : false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  const resetForm = () => {
    setName(initialValues?.name || "");
    setIsRevenue(initialValues?.is_revenue !== undefined ? initialValues.is_revenue : false);
    setNameError("");
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }

    setNameError("");
    setIsSubmitting(true);

    try {
      await onSubmit({ name, is_revenue: isRevenue });
      resetForm();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className={nameError ? "border-destructive" : ""}
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={isRevenue ? "revenue" : "expense"}
                onValueChange={(value) => setIsRevenue(value === "revenue")}
                disabled={isEditing}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
