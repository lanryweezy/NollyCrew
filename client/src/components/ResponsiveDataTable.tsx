import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ResponsiveCard from "@/components/ResponsiveCard";

interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: T[keyof T]) => ReactNode;
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
}

export default function ResponsiveDataTable<T>({ 
  data,
  columns,
  className = ""
}: ResponsiveDataTableProps<T>) {
  return (
    <ResponsiveCard className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className="text-xs sm:text-sm font-medium"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={colIndex} 
                  className="text-xs sm:text-sm py-2 sm:py-3"
                >
                  {column.cell 
                    ? column.cell(row[column.accessorKey]) 
                    : String(row[column.accessorKey])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveCard>
  );
}