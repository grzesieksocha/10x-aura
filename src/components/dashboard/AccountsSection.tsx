import React from "react";
import AccountsHeader from "@/components/dashboard/AccountsHeader";
import AccountsList from "@/components/dashboard/AccountsList";
import type { DashboardAccount } from "src/types";

interface AccountsSectionProps {
  accounts: DashboardAccount[];
}

const AccountsSection: React.FC<AccountsSectionProps> = ({ accounts }) => (
  <section>
    <AccountsHeader />
    <AccountsList accounts={accounts} />
  </section>
);

export default AccountsSection;
