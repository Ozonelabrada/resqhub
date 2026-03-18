import React, { useMemo, useState } from 'react';
import { MoreVertical, Plus, Clock, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedTableTemplate, Badge, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { RiderData } from '../hooks/useRidersList';
import type { EnhancedTableColumn } from '@/components/ui';

interface RidersTableProps {
  riders: RiderData[];
  loading: boolean;
  onGrant: (riderId: string) => void;
  onDeduct: (riderId: string) => void;
  onViewHistory: (riderId: string) => void;
  onToggleExemption?: (riderId: string, isExempted?: boolean, reason?: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

const getApprovalStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getActivityColor = (isActive: boolean) => {
  return isActive ? 'text-green-600' : 'text-gray-600';
};

export const RidersTable: React.FC<RidersTableProps> = ({
  riders,
  loading,
  onGrant,
  onDeduct,
  onViewHistory,
  onToggleExemption,
  pagination,
  onPageChange,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmExemptionId, setConfirmExemptionId] = useState<string | null>(null);
  const [toggleToExempted, setToggleToExempted] = useState<boolean>(true);
  const [exemptionReason, setExemptionReason] = useState('Admin action - Set free from payment requirements');
  const confirmedRider = riders.find((r) => String(r.id) === confirmExemptionId);

  const columns: EnhancedTableColumn[] = useMemo(
    () => [
      {
        header: 'Rider Info',
        key: 'riderInfo',
        width: '200px',
        render: (_, row: RiderData) => (
          <div className="space-y-1">
            <p className="font-bold text-gray-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-gray-600">{row.email}</p>
            <p className="text-xs text-gray-500">ID: {row.userId.substring(0, 8)}</p>
          </div>
        ),
      },
      {
        header: 'Vehicle',
        key: 'vehicle',
        width: '100px',
        render: (vehicle: string) => (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
            {vehicle || 'N/A'}
          </Badge>
        ),
      },
      {
        header: 'Rating',
        key: 'rating',
        width: '80px',
        className: 'text-center',
        render: (rating: number) => <div className="font-bold text-yellow-600">{rating.toFixed(1)} ⭐</div>,
      },
      {
        header: 'Rides',
        key: 'rides',
        width: '100px',
        className: 'text-right',
        render: (_, row: RiderData) => (
          <div className="text-sm space-y-0.5">
            <p className="font-semibold text-green-600">{row.totalCompletedRides} completed</p>
            <p className="text-xs text-red-600">{row.cancelledRides} cancelled</p>
          </div>
        ),
      },
      {
        header: 'Credits Volume',
        key: 'credits',
        width: '120px',
        render: (_, row: RiderData) => {
          const canBook = row.isExempted || (row.credits.totalCreditsRemaining || row.credits.creditCount) > 0;
          return (
            <div className="space-y-1">
              <p className="font-bold text-teal-600 text-lg">{row.credits.totalCreditsRemaining || row.credits.creditCount}</p>
              <p className="text-xs text-gray-500">Remaining Credits</p>
              <p
                className={cn(
                  'text-xs font-medium',
                  canBook ? 'text-green-600' : 'text-red-600'
                )}
              >
                {canBook ? '✓ Can Book' : '✗ Cannot Book'}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Status',
        key: 'status',
        width: '120px',
        render: (_, row: RiderData) => (
          <div className="space-y-2">
            <Badge className={getApprovalStatusColor(row.approvalStatus)}>
              {row.approvalStatus}
            </Badge>
            <div
              className={cn(
                'text-xs font-semibold px-2 py-1 rounded inline-block',
                getActivityColor(row.isActive)
              )}
            >
              {row.isActive ? '🟢 Active' : '⚫ Inactive'}
            </div>
          </div>
        ),
      },
      {
        header: 'Plan',
        key: 'exemption',
        width: '100px',
        className: 'text-center',
        render: (_, row: RiderData) => (
          <Badge className={row.isExempted ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}>
            {row.isExempted ? '🎁 Free' : '💎 Premium'}
          </Badge>
        ),
      },
      {
        header: 'Actions',
        key: 'actions',
        width: '100px',
        className: 'text-center',
        render: (_, row: RiderData) => (
          <div className="relative w-full flex justify-center">
            <button
              onClick={() => setOpenMenu(openMenu === String(row.id) ? null : String(row.id))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
              title="More actions"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>

            {openMenu === String(row.id) && (
              <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-max">
                <button
                  onClick={() => {
                    onGrant(String(row.id));
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 border-b transition-colors"
                >
                  <Plus size={16} className="text-green-600 flex-shrink-0" />
                  <span>Grant Credits</span>
                </button>
                <button
                  onClick={() => {
                    onDeduct(String(row.id));
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 border-b transition-colors"
                >
                  <Plus size={16} className="text-red-600 rotate-45 flex-shrink-0" />
                  <span>Deduct Credits</span>
                </button>
                {onToggleExemption && (
                  <button
                    onClick={() => {
                      const isCurrentlyExempted = row.isExempted ?? false;
                      setToggleToExempted(!isCurrentlyExempted);
                      setExemptionReason(
                        !isCurrentlyExempted
                          ? 'Admin action - Set free from payment requirements'
                          : 'Admin action - Changed to premium (charges apply)'
                      );
                      setConfirmExemptionId(String(row.id));
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b transition-colors"
                  >
                    <Gift size={16} className="text-blue-600 flex-shrink-0" />
                    <span>{(row.isExempted ?? false) ? 'Set Premium' : 'Set Free'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onViewHistory(String(row.id));
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                >
                  <Clock size={16} className="text-purple-600 flex-shrink-0" />
                  <span>View History</span>
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openMenu, onGrant, onDeduct, onViewHistory, onToggleExemption, riders]
  );

  const canGoPrevious = pagination ? pagination.page > 1 : false;
  const canGoNext = pagination ? pagination.page < pagination.totalPages : false;

  const handlePreviousPage = () => {
    if (canGoPrevious && pagination && onPageChange) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext && pagination && onPageChange) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Riders Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination
              ? `Showing ${(pagination.page - 1) * pagination.pageSize + 1} to ${Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of ${pagination.totalCount} riders`
              : `Found ${riders.length} riders`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Per page:</label>
          <select
            disabled
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <EnhancedTableTemplate
        columns={columns}
        rows={riders}
        loading={loading}
        emptyMessage="No riders found"
        tableHeight="h-[600px]"
      />

      {/* Pagination Footer */}
      {pagination && (
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-bold">{pagination.page}</span> of{' '}
            <span className="font-bold">{pagination.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
              className={cn(
                'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
                canGoPrevious
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!canGoNext}
              className={cn(
                'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
                canGoNext
                  ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Toggle Exemption */}
      {confirmExemptionId && confirmedRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <Card className="p-6 max-w-md w-full mx-4 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {toggleToExempted ? 'Confirm Set Free Action' : 'Confirm Set Premium Action'}
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to set <span className="font-bold">{confirmedRider.firstName} {confirmedRider.lastName}</span> as{' '}
              <span className="font-bold">{toggleToExempted ? 'exempt (Free)' : 'not exempt (Premium)'}</span>?
            </p>
            <p className={`text-sm p-3 rounded-lg mb-4 border ${
              toggleToExempted
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-orange-600 bg-orange-50 border-orange-200'
            }`}>
              {toggleToExempted
                ? '✓ Rider will not incur charges for bookings'
                : '⚠️ Rider will now incur charges for bookings'}
            </p>
            
            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
              <textarea
                value={exemptionReason}
                onChange={(e) => setExemptionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmExemptionId(null);
                  setExemptionReason('Admin action - Set free from payment requirements');
                  setToggleToExempted(true);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmExemptionId && onToggleExemption) {
                    onToggleExemption(confirmExemptionId, toggleToExempted, exemptionReason);
                  }
                  setConfirmExemptionId(null);
                  setExemptionReason('Admin action - Set free from payment requirements');
                  setToggleToExempted(true);
                  setOpenMenu(null);
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                  toggleToExempted
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {toggleToExempted ? 'Confirm Set Free' : 'Confirm Set Premium'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
