import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/db/database.types";

type Account = Tables<"accounts">;
type DialogMode = "add" | "edit";

export default function AccountsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("add");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    initial_balance: 0,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error: unknown) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (mode: DialogMode, account?: Account) => {
    setDialogMode(mode);
    if (mode === "edit" && account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        initial_balance: account.initial_balance,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: "",
        initial_balance: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      name: "",
      initial_balance: 0,
    });
  };

  const handleDelete = async (accountId: number) => {
    if (!confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      return;
    }

    setIsDeletingAccount(accountId);
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (dialogMode === "edit" && editingAccount) {
        const response = await fetch(`/api/accounts/${editingAccount.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formData.name }),
        });

        if (!response.ok) {
          throw new Error("Failed to update account");
        }

        const updatedAccount = await response.json();
        setAccounts((prev) => prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)));
        toast.success("Account updated successfully");
      } else {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create account");
        }

        const createdAccount = await response.json();
        setAccounts((prev) => [...prev, createdAccount]);
        toast.success("Account created successfully");
      }
      handleCloseDialog();
    } catch (error: unknown) {
      console.error("Failed to save account:", error);
      toast.error(`Failed to ${dialogMode === "edit" ? "update" : "create"} account`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => handleOpenDialog("add")}>Add Account</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit Account" : "Add New Account"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "edit" ? "Update your account details." : "Create a new account to track your finances."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter account name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                value={formData.initial_balance}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    initial_balance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                required
                disabled={dialogMode === "edit"}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{dialogMode === "edit" ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No accounts found.</p>
          <p className="text-muted-foreground">
            Click the &quot;Add Account&quot; button to create your first account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-8 w-8"
                  onClick={() => handleOpenDialog("edit", account)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-14 top-4 h-8 w-8"
                  onClick={() => handleDelete(account.id)}
                  disabled={isDeletingAccount === account.id}
                >
                  {isDeletingAccount === account.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  )}
                </Button>
                <a href={`/account/${account.id}`} className="block hover:opacity-80">
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription>Account Balance</CardDescription>
                </a>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${account.initial_balance.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
