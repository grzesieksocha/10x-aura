import React from "react";
import TotalBalanceCard from "@/components/dashboard/TotalBalanceCard";

interface DashboardHeaderProps {
  totalBalance: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalBalance }) => (
  <section>
    <TotalBalanceCard totalBalance={totalBalance} />
  </section>
);

export default DashboardHeader;
