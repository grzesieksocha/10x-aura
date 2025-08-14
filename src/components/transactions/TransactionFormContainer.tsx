import React, { useState } from "react";
import { TransactionForm, type TransactionFormData } from "./TransactionForm";
import type { DashboardAccount } from "@/types";

interface TransactionFormContainerProps {
  account: DashboardAccount;
  onTransactionAdded?: () => void;
  children: (methods: {
    openExpense: () => void;
    openRevenue: () => void;
    openTransfer: () => void;
  }) => React.ReactNode;
}

export function TransactionFormContainer({ account, onTransactionAdded, children }: TransactionFormContainerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "revenue" | "transfer">("expense");

  const openTransactionForm = (type: "expense" | "revenue" | "transfer") => {
    setTransactionType(type);
    setFormOpen(true);
  };

  const handleSubmitTransaction = async (data: TransactionFormData) => {
    try {
      const endpoint = data.type === "transfer" ? "/api/transactions/transfer" : "/api/transactions";

      const payload =
        data.type === "transfer"
          ? {
              source_account_id: account.id,
              destination_account_id: data.destinationAccountId,
              amount: data.amount, // Already converted in the service
              transaction_date: new Date(data.date).toISOString(),
              description: data.description,
            }
          : {
              account_id: account.id,
              amount: data.amount, // Already converted in the service
              category_id: data.categoryId,
              description: data.description,
              transaction_date: new Date(data.date).toISOString(),
              transaction_type: data.type,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      // Refresh transactions and account balance
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  };

  const formMethods = {
    openExpense: () => openTransactionForm("expense"),
    openRevenue: () => openTransactionForm("revenue"),
    openTransfer: () => openTransactionForm("transfer"),
  };

  return (
    <>
      <TransactionForm
        type={transactionType}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitTransaction}
        initialData={{
          type: transactionType,
          amount: 0,
        }}
        currentAccountId={account.id}
      />

      {children(formMethods)}
    </>
  );
}
