import React from "react";
import AccountItem from "@/components/dashboard/AccountItem";
import type { DashboardAccount } from "src/types";

interface AccountsListProps {
  accounts: DashboardAccount[];
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return <div>Brak kont do wyświetlenia</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountItem key={account.id} account={account} />
      ))}
    </div>
  );
};

export default AccountsList;
