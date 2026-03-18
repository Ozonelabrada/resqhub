import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditPurchase } from '../hooks/useCreditHistoryAll';

interface CreditPurchasesTableProps {
  purchases: CreditPurchase[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  showSummaryStats?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentMethodColor = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'card':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'online':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'admin_grant':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

/**
 * Reusable Credit Purchases Table Component
 * Shows credit purchase history with expandable detail rows
 * Can be used in CreditHistoryAllView and RiderCreditsPage
 */
export const CreditPurchasesTable: React.FC<CreditPurchasesTableProps> = ({
  purchases,
  pagination,
  onPageChange,
  onPageSizeChange,
  onNextPage,
  onPreviousPage,
  showSummaryStats = true,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Calculate summary stats
  const totalStats = {
    totalCredits: purchases.reduce((sum, p) => sum + p.creditsAcquired, 0),
    totalAmount: purchases.reduce((sum, p) => sum + p.amountPaid, 0),
    completedCount: purchases.filter((p) => p.purchaseStatus === 'completed').length,
    pendingCount: purchases.filter((p) => p.purchaseStatus === 'pending_approval').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {showSummaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs font-medium text-blue-600 mb-1">Total Credits</p>
            <p className="text-2xl font-bold text-blue-900">{totalStats.totalCredits.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Across {pagination.totalCount} purchases</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-xs font-medium text-green-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-900">
              ₱{totalStats.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-600 mt-1">{pagination.totalCount} purchases</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-xs font-medium text-green-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{totalStats.completedCount}</p>
            <p className="text-xs text-green-600 mt-1">Processed</p>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-xs font-medium text-yellow-600 mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-900">{totalStats.pendingCount}</p>
            <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
          </Card>
        </div>
      )}

      {/* Credit Purchases Table */}
      <Card className="overflow-hidden flex flex-col h-[700px]">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Credit Purchases History</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} purchases
            </p>
          </div>
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Per page:</label>
              <select
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                defaultValue={pagination.pageSize}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Expires</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <DollarSign className="mx-auto mb-3 text-gray-400" size={32} />
                    <p className="text-gray-600 font-medium">No credit purchases found</p>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase, idx) => (
                  <React.Fragment key={purchase.purchaseId}>
                    <tr
                      className={cn(
                        'border-b hover:bg-gray-50 transition-colors',
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      )}
                    >
                      <td className="px-6 py-4 text-center w-12">
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === purchase.purchaseId ? null : purchase.purchaseId)
                          }
                          className="p-1 hover:bg-gray-200 rounded inline-flex items-center justify-center"
                          title="Toggle details"
                        >
                          {expandedId === purchase.purchaseId ? (
                            <ChevronUp size={16} className="text-gray-600" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {purchase.user?.firstName && purchase.user?.lastName
                          ? `${purchase.user.firstName} ${purchase.user.lastName}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{purchase.creditsAcquired}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₱{purchase.amountPaid.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(getPaymentMethodColor(purchase.paymentMethod), 'border')}
                        >
                          {purchase.paymentMethod || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(purchase.purchaseStatus)}>
                          {purchase.purchaseStatus === 'pending_approval'
                            ? 'Pending'
                            : purchase.purchaseStatus === 'completed'
                              ? 'Completed'
                              : 'Cancelled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={cn(purchase.isExpired && 'text-red-600 font-bold')}>
                          {new Date(purchase.expiresAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                    {/* Expandable Details Row */}
                    {expandedId === purchase.purchaseId && (
                      <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td colSpan={8} className="px-6 py-4 border-b">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold text-gray-900">Payment Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Payment Reference</p>
                                <code className="text-sm font-mono text-gray-700 break-all bg-white p-2 rounded border border-blue-100 block">
                                  {purchase.paymentReference || 'N/A'}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">User ID</p>
                                <code className="text-sm font-mono text-gray-700 break-all bg-white p-2 rounded border border-blue-100 block">
                                  {purchase.user?.userId || 'N/A'}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100">
                                  {purchase.user?.email || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Payment Date</p>
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100">
                                  {new Date(purchase.purchaseDate).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Expiry Status</p>
                                <p
                                  className={cn(
                                    'text-sm font-bold bg-white p-2 rounded border border-blue-100',
                                    purchase.isExpired ? 'text-red-600' : 'text-green-600'
                                  )}
                                >
                                  {purchase.isExpired ? 'Expired' : 'Active'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Expires At</p>
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100">
                                  {new Date(purchase.expiresAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {purchase.notes && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100">
                                  {purchase.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {(onNextPage || onPreviousPage || onPageChange) && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Page <span className="font-bold">{pagination.pageNumber}</span> of{' '}
              <span className="font-bold">{pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onPreviousPage}
                disabled={!pagination.hasPreviousPage}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
                  pagination.hasPreviousPage
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                )}
              >
                Previous
              </button>
              <button
                onClick={onNextPage}
                disabled={!pagination.hasNextPage}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
                  pagination.hasNextPage
                    ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreditPurchasesTable;
