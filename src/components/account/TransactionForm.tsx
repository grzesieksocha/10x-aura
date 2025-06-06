import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Tables } from "@/db/database.types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface TransactionFormProps {
  type: Tables<"transactions">["transaction_type"];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  initialData?: Partial<TransactionFormData>;
  currentAccountId?: number;
}

export interface TransactionFormData {
  type: Tables<"transactions">["transaction_type"];
  amount: number;
  date: string;
  description?: string;
  categoryId?: number;
  destinationAccountId?: number;
}

interface Category {
  id: number;
  name: string;
  is_revenue: boolean;
}

interface Account {
  id: number;
  name: string;
}

export function TransactionForm({
  type,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentAccountId,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<TransactionFormData>({
    type,
    amount: initialData?.amount || 0,
    date: initialData?.date || format(new Date(), "yyyy-MM-dd"),
    description: initialData?.description,
    categoryId: initialData?.categoryId,
    destinationAccountId: initialData?.destinationAccountId,
  });

  // Fetch categories and accounts when the form opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
          // Fetch categories based on transaction type
          const categoriesResponse = await fetch("/api/categories");
          if (!categoriesResponse.ok) {
            throw new Error("Failed to fetch categories");
          }
          const categoriesData: Category[] = await categoriesResponse.json();

          // Filter categories by transaction type if needed
          const filteredCategories =
            type === "revenue"
              ? categoriesData.filter((c) => c.is_revenue)
              : type === "expense"
                ? categoriesData.filter((c) => !c.is_revenue)
                : categoriesData;

          setCategories(filteredCategories);

          // Fetch accounts for transfers
          if (type === "transfer") {
            const accountsResponse = await fetch("/api/accounts");
            if (!accountsResponse.ok) {
              throw new Error("Failed to fetch accounts");
            }
            const accountsData: Account[] = await accountsResponse.json();
            // Filter out current account
            const filteredAccounts = currentAccountId
              ? accountsData.filter((a) => a.id !== currentAccountId)
              : accountsData;
            setAccounts(filteredAccounts);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, type, currentAccountId]);

  // Update form data when transaction type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (!formData.date) {
      setError("Date is required");
      return;
    }

    if (type !== "transfer" && !formData.categoryId) {
      setError("Please select a category");
      return;
    }

    if (type === "transfer" && !formData.destinationAccountId) {
      setError("Please select a destination account");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      setError(error instanceof Error ? error.message : "Failed to submit transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md sm:px-8">
        <SheetHeader className="px-2">
          <SheetTitle>
            {initialData ? "Edit" : "Add"} {type.charAt(0).toUpperCase() + type.slice(1)}
          </SheetTitle>
          <SheetDescription>Fill in the details for your {type}.</SheetDescription>
        </SheetHeader>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mt-2 mx-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6 mt-6 px-2">
          <div className="space-y-3">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="py-6"
            />
          </div>

          <div className="space-y-3">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal py-6">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      date: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="py-6"
            />
          </div>

          {type !== "transfer" && (
            <div className="space-y-3">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId?.toString()}
                onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                disabled={loading}
              >
                <SelectTrigger className="py-6">
                  <SelectValue placeholder={loading ? "Loading..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "transfer" && (
            <div className="space-y-3">
              <Label htmlFor="destinationAccount">Destination Account</Label>
              <Select
                value={formData.destinationAccountId?.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    destinationAccountId: parseInt(value),
                  })
                }
                disabled={loading}
              >
                <SelectTrigger className="py-6">
                  <SelectValue placeholder={loading ? "Loading..." : "Select an account"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" type="button" onClick={onClose} className="px-6 py-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading} className="px-6 py-6">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
