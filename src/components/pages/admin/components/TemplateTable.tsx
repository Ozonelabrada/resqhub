import React from 'react';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TemplateTableColumn {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

export interface TemplateTableAction {
  key: string;
  label: string | ((row: any) => string);
  onClick: (row: any) => void;
  className?: string;
}

export interface TemplateTableHeader {
  title: string;
  description?: string;
}

export interface TemplateTableEmpty {
  title?: string;
  description?: string;
}

export interface TemplateTablePagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface TemplateTableProps {
  // Header
  header?: TemplateTableHeader;
  
  // Columns and Data
  columns: TemplateTableColumn[];
  data: any[];
  
  // Actions
  actions?: TemplateTableAction[];
  
  // Toolbar (filters, search, etc)
  toolbar?: React.ReactNode;
  
  // States
  loading?: boolean;
  empty?: TemplateTableEmpty;
  
  // Pagination
  pagination?: TemplateTablePagination;
  onPageChange?: (page: number) => void;
  
  // Legacy props for backwards compatibility
  onGrant?: (id: string) => void;
  onDeduct?: (id: string) => void;
  onViewHistory?: (id: string) => void;
  onToggleExemption?: (id: string, isExempted: boolean, reason: string) => void;
}

export const TemplateTable: React.FC<TemplateTableProps> = ({
  header,
  columns,
  data,
  actions,
  toolbar,
  loading,
  empty,
  pagination,
  onPageChange,
  // Legacy props
  onGrant,
  onDeduct,
  onViewHistory,
  onToggleExemption,
}) => {
  // Build legacy actions if any legacy handlers are provided
  const defaultActions: TemplateTableAction[] = [];
  if (onGrant) defaultActions.push({ key: 'grant', label: 'Grant', onClick: (row) => onGrant(row.id), className: 'text-blue-600' });
  if (onDeduct) defaultActions.push({ key: 'deduct', label: 'Deduct', onClick: (row) => onDeduct(row.id), className: 'text-red-600' });
  if (onViewHistory) defaultActions.push({ key: 'history', label: 'History', onClick: (row) => onViewHistory(row.id), className: 'text-gray-600' });
  if (onToggleExemption) defaultActions.push({ key: 'toggle', label: 'Exempt', onClick: (row) => onToggleExemption(row.id, !row.isExempted, 'Admin action'), className: 'text-yellow-600' });
  
  // Use new actions if provided, otherwise fall back to legacy actions
  const tableActions = actions || (defaultActions.length > 0 ? defaultActions : []);

  return (
    <div className="space-y-4">
      {/* Header */}
      {header && (
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{header.title}</h2>
          {header.description && (
            <p className="text-gray-600 text-sm mt-1">{header.description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      {toolbar && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {toolbar}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
              {tableActions.length > 0 && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (tableActions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (tableActions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="text-gray-500">
                    <p className="text-sm font-medium">{empty?.title || 'No data found'}</p>
                    {empty?.description && (
                      <p className="text-xs mt-1">{empty.description}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {tableActions.length > 0 && (
                    <td className="px-4 py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {tableActions.map((action) => (
                            <DropdownMenuItem
                              key={action.key}
                              onClick={() => action.onClick(row)}
                              className={`cursor-pointer ${action.className || ''}`}
                            >
                              {typeof action.label === 'function' ? action.label(row) : action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-sm">{pagination.currentPage}</span>
            <button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage * pagination.pageSize >= pagination.total}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
