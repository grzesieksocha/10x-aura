import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAccount } from "@/types";
import { TransactionFormContainer } from "./TransactionFormContainer";

interface AccountHeaderProps {
  account: DashboardAccount;
  onTransactionAdded?: () => void;
}

export function AccountHeader({ account, onTransactionAdded }: AccountHeaderProps) {
  const balance = account.current_balance ?? account.initial_balance;

  return (
    <TransactionFormContainer account={account} onTransactionAdded={onTransactionAdded}>
      {({ openExpense, openRevenue, openTransfer }) => (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{account.name}</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={openExpense}>
                Add Expense
              </Button>
              <Button variant="outline" size="sm" onClick={openRevenue}>
                Add Revenue
              </Button>
              <Button variant="outline" size="sm" onClick={openTransfer}>
                Transfer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Balance: ${balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}
    </TransactionFormContainer>
  );
}
