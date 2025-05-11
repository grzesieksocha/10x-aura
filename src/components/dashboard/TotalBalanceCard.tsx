import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TotalBalanceCardProps {
  totalBalance: number;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ totalBalance }) => (
  <Card>
    <CardHeader>
      <CardTitle>Łączne saldo</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {totalBalance.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
      </div>
    </CardContent>
  </Card>
);

export default TotalBalanceCard;
