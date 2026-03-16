import React, { useMemo, useState } from 'react';
import { MoreVertical, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { RiderData } from '../hooks/useRidersList';

interface RidersTableProps {
  riders: RiderData[];
  loading: boolean;
  onGrant: (riderId: string) => void;
  onDeduct: (riderId: string) => void;
  onViewHistory: (riderId: string) => void;
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
  pagination,
  onPageChange,
}) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading riders...</p>
      </Card>
    );
  }

  if (!riders || riders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600 font-medium">No riders found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search criteria</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Rider Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Vehicle</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700">Rating</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700">Rides</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Credits Volume</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider, idx) => (
                <tr key={`${rider.id}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {/* Rider Info */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{rider.firstName} {rider.lastName}</p>
                      <p className="text-xs text-gray-600">{rider.email}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {rider.userId.substring(0, 8)}</p>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="px-6 py-4">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                      {rider.vehicle || 'N/A'}
                    </Badge>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-yellow-600">
                      {rider.rating.toFixed(1)} ⭐
                    </div>
                  </td>

                  {/* Rides */}
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm">
                      <p className="font-semibold text-green-600">{rider.totalCompletedRides} completed</p>
                      <p className="text-xs text-red-600">{rider.cancelledRides} cancelled</p>
                    </div>
                  </td>

                  {/* Credits Volume */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-teal-600 text-lg">{rider.credits.creditCount}</p>
                      <p className="text-xs text-gray-600">₱{parseFloat(rider.credits.totalValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                      <p className={cn(
                        'text-xs font-medium',
                        rider.credits.canAcceptBookings ? 'text-green-600' : 'text-red-600'
                      )}>
                        {rider.credits.canAcceptBookings ? '✓ Can Book' : '✗ Cannot Book'}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Badge className={getApprovalStatusColor(rider.approvalStatus)}>
                        {rider.approvalStatus}
                      </Badge>
                      <div className={cn(
                        'text-xs font-semibold px-2 py-1 rounded inline-block',
                        getActivityColor(rider.isActive)
                      )}>
                        {rider.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="relative flex justify-center">
                      <button
                        onClick={() => setOpenMenu(openMenu === rider.id ? null : rider.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                      {openMenu === rider.id && (
                        <div className="absolute right-0 mt-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                          <button
                            onClick={() => {
                              onGrant(String(rider.id));
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 border-b"
                          >
                            <Plus size={16} className="text-green-600" />
                            Grant Credits
                          </button>
                          <button
                            onClick={() => {
                              onDeduct(String(rider.id));
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 border-b"
                          >
                            <Plus size={16} className="text-red-600 rotate-45" />
                            Deduct Credits
                          </button>
                          <button
                            onClick={() => {
                              onViewHistory(String(rider.id));
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <Clock size={16} className="text-blue-600" />
                            View History
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalCount)} to {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} riders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="flex items-center px-3 text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
