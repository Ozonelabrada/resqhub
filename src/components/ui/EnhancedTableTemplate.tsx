import React from 'react';
import { Card, Button, Spinner } from './index';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EnhancedTableColumn {
  header: string;
  key?: string;
  className?: string;
  width?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface EnhancedTableTemplateProps {
  columns: EnhancedTableColumn[];
  rows: any[];
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  tableHeight?: string; // e.g., 'h-[500px]', default 'h-[600px]'
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  showRowNumbers?: boolean;
}

/**
 * Enhanced Table Template for consistent UI/UX across admin tables
 * Features:
 * - Fixed height with scrollable tbody
 * - Sticky header while scrolling
 * - Fixed pagination footer
 * - Better empty state
 * - Consistent styling
 */
export const EnhancedTableTemplate: React.FC<EnhancedTableTemplateProps> = ({
  columns,
  rows,
  loading = false,
  empty = false,
  emptyMessage = 'No data found',
  tableHeight = 'h-[600px]',
  pagination,
  onPageChange,
  showRowNumbers = false,
}) => {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', tableHeight)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-600 font-medium">Loading data...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden flex flex-col', tableHeight)}>
      {/* Table Container with Fixed Height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Scrollable Table Body */}
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full">
            {/* Sticky Header */}
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {showRowNumbers && (
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 w-12">
                    #
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      'px-6 py-4 text-left text-xs font-bold text-gray-700',
                      col.className
                    )}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showRowNumbers ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="space-y-2">
                      <p className="text-gray-600 font-medium">{emptyMessage}</p>
                      <p className="text-gray-500 text-sm">
                        No records available. Try adjusting your filters or search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={cn(
                      'border-b border-gray-200 hover:bg-gray-50 transition-colors',
                      rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    )}
                  >
                    {showRowNumbers && (
                      <td className="px-4 py-4 text-xs text-gray-500 font-medium w-12">
                        {rowIdx + 1}
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn('px-6 py-4', col.className)}
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.render ? col.render(row[col.key!], row, rowIdx) : row[col.key!]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            <span>
              Showing{' '}
              <span className="font-bold">
                {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalCount)}
              </span>{' '}
              to{' '}
              <span className="font-bold">
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalCount
                )}
              </span>{' '}
              of <span className="font-bold">{pagination.totalCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-white border border-gray-300 rounded">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedTableTemplate;
