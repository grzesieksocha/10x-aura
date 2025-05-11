import React from "react";
import type { DashboardAccount } from "src/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface AccountItemProps {
  account: DashboardAccount;
}

const AccountItem: React.FC<AccountItemProps> = ({ account }) => (
  <a href={`/accounts/${account.id}`} className="block hover:shadow-md transition-shadow">
    <Card>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        <CardDescription>Account Balance</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {account.current_balance.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
        </p>
      </CardContent>
    </Card>
  </a>
);

export default AccountItem;
