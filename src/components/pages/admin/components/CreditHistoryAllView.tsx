import React from 'react';
import { Card, Badge } from '@/components/ui';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import { CreditPurchasesTable } from './CreditPurchasesTable';
import type { CreditHistoryAllResponse } from '../hooks/useCreditHistoryAll';

interface CreditHistoryAllViewProps {
  data: CreditHistoryAllResponse | null;
  loading: boolean;
  error?: string | null;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
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

export const CreditHistoryAllView: React.FC<CreditHistoryAllViewProps> = ({
  data,
  loading,
  error,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onNextPage,
  onPreviousPage,
}) => {
  if (error && !data) {
    return (
      <Card className="p-8 text-center border-red-200 bg-red-50">
        <AlertCircle className="mx-auto mb-3 text-red-600" size={40} />
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-red-500 mt-1">Unable to load credit history</p>
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto mb-3 text-gray-400 animate-spin" size={32} />
        <p className="text-gray-600">Loading credit history...</p>
      </Card>
    );
  }

  if (!data || data.purchases.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed">
        <DollarSign className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600 font-medium">No credit purchases found</p>
        <p className="text-sm text-gray-500 mt-1">No purchases for {data?.filters.serviceType || 'this service type'}</p>
      </Card>
    );
  }

  return (
    <CreditPurchasesTable
      purchases={data.purchases}
      pagination={data.pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
      showSummaryStats={true}
    />
  );
};
