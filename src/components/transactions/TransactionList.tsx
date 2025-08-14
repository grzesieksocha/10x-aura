import { format } from "date-fns";
import type { Tables } from "@/db/database.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListProps {
  transactions: Tables<"transactions">[];
  isLoading: boolean;
}

const transactionTypeColors = {
  expense: "destructive",
  revenue: "success",
  transfer: "secondary",
} as const;

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (!transactions.length) {
    return <div className="text-center py-6 text-muted-foreground">No transactions found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{format(new Date(transaction.transaction_date), "PPP")}</TableCell>
            <TableCell>
              <Badge variant={transactionTypeColors[transaction.transaction_type]}>
                {transaction.transaction_type}
              </Badge>
            </TableCell>
            <TableCell>{transaction.description || "-"}</TableCell>
            <TableCell className="text-right">
              <span className={transaction.transaction_type === "expense" ? "text-destructive" : "text-success"}>
                {transaction.transaction_type === "expense" ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
