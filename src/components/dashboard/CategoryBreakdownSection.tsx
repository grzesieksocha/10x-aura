import React from "react";
import type { CategoryBreakdownDTO } from "src/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface CategoryBreakdownSectionProps {
  data: CategoryBreakdownDTO[];
}

const CategoryBreakdownSection: React.FC<CategoryBreakdownSectionProps> = ({ data }) => (
  <section>
    <div className="mb-2">
      <h2 className="text-xl font-semibold">Expense Breakdown</h2>
    </div>
    {data.length === 0 ? (
      <div>No expense data for the selected month</div>
    ) : (
      <div className="max-w-md mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.category}>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right font-medium">
                  {item.total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </section>
);

export default CategoryBreakdownSection;
