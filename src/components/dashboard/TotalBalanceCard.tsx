import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TotalBalanceCardProps {
  totalBalance: number;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ totalBalance }) => (
  <Card>
    <CardHeader>
      <CardTitle>Total Balance</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {totalBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </div>
    </CardContent>
  </Card>
);

export default TotalBalanceCard;
