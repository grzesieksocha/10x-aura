import { useAccountDetails } from "@/components/hooks/useAccountDetails";
import { useTransactions } from "@/components/hooks/useTransactions";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AccountHeader } from "@/components/account/AccountHeader";

interface AccountDetailsViewProps {
  accountId: number;
}

export function AccountDetailsView({ accountId }: AccountDetailsViewProps) {
  const { account, isLoading: isAccountLoading, refresh: refreshAccount } = useAccountDetails(accountId);
  const {
    transactions,
    isLoading: isTransactionsLoading,
    filters,
    setFilters,
    refresh: refreshTransactions,
  } = useTransactions(accountId);

  const handleTransactionAdded = () => {
    refreshAccount();
    refreshTransactions();
  };

  if (isAccountLoading) {
    return <div>Loading account details...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <AccountHeader account={account} onTransactionAdded={handleTransactionAdded} />
      <TransactionFilters filters={filters} onFilterChange={setFilters} />
      <TransactionList transactions={transactions} isLoading={isTransactionsLoading} />
    </div>
  );
}
