import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Spinner
} from '../index';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
}

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  ({
    data,
    columns,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    onPageChange,
    emptyMessage = 'No data found',
    rowClassName,
    onRowClick,
  }, ref) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-4">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead 
                        key={String(col.key)} 
                        className={col.className}
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => {
                    const defaultRowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    const customRowClass = 
                      typeof rowClassName === 'function' 
                        ? rowClassName(item, idx) 
                        : rowClassName;
                    const finalRowClass = customRowClass || defaultRowClass;

                    return (
                      <TableRow
                        key={idx}
                        className={`${finalRowClass} ${onRowClick ? 'cursor-pointer hover:bg-teal-50 transition-colors' : ''}`}
                        onClick={() => onRowClick?.(item, idx)}
                      >
                        {columns.map((col) => (
                          <TableCell key={String(col.key)}>
                            {col.render 
                              ? col.render((item as any)[col.key as string], item, idx)
                              : (item as any)[col.key as string]
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {onPageChange && totalPages > 1 && (
              <div className="p-4 flex items-center justify-between bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold">{currentPage}</span> of{' '}
                  <span className="font-bold">{totalPages}</span> ({' '}
                  <span className="font-bold">{totalCount}</span> total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="gap-2"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;
