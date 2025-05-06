import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/db/database.types";

interface AccountHeaderProps {
  account: Tables<"accounts">;
}

export function AccountHeader({ account }: AccountHeaderProps) {
  const balance = account.initial_balance; // TODO: Calculate actual balance from transactions

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{account.name}</CardTitle>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            Add Expense
          </Button>
          <Button variant="outline" size="sm">
            Add Revenue
          </Button>
          <Button variant="outline" size="sm">
            Transfer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">Balance: ${balance.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
