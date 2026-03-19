import React from 'react';

export interface TemplateTableColumn {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

export interface TemplateTableProps {
  data: any[];
  columns: TemplateTableColumn[];
  loading?: boolean;
  onGrant?: (id: string) => void;
  onDeduct?: (id: string) => void;
  onViewHistory?: (id: string) => void;
  onToggleExemption?: (id: string, isExempted: boolean, reason: string) => void;
  pagination?: any;
  onPageChange?: (page: number) => void;
}

export const TemplateTable: React.FC<TemplateTableProps> = ({
  data,
  columns,
  loading,
  onGrant,
  onDeduct,
  onViewHistory,
  onToggleExemption,
  pagination,
  onPageChange,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">{col.label}</th>
            ))}
            <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1} className="text-center py-4">Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="text-center py-4">No data found.</td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 border-b">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-2 border-b">
                  {onGrant && <button className="mr-2 text-blue-600" onClick={() => onGrant(row.id)}>Grant</button>}
                  {onDeduct && <button className="mr-2 text-red-600" onClick={() => onDeduct(row.id)}>Deduct</button>}
                  {onViewHistory && <button className="mr-2 text-gray-600" onClick={() => onViewHistory(row.id)}>History</button>}
                  {onToggleExemption && <button className="text-yellow-600" onClick={() => onToggleExemption(row.id, !row.isExempted, 'Admin action')}>{row.isExempted ? 'Remove Exemption' : 'Exempt'}</button>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination controls can be added here if needed */}
    </div>
  );
};
