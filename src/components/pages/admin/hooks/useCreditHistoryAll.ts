import { useState } from 'react';
import { AdminService } from '@/services/adminService';

export interface CreditPurchaseUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface CreditPurchase {
  purchaseId: number;
  purchaseDate: string;
  paymentReference: string;
  paymentMethod: string;
  creditsAcquired: number;
  amountPaid: number;
  purchaseStatus: 'pending_approval' | 'completed' | 'cancelled';
  expiresAt: string;
  isExpired: boolean;
  notes?: string;
  user: CreditPurchaseUser;
}

export interface CreditHistoryAllResponse {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    serviceType: string;
  };
  purchases: CreditPurchase[];
}

export const useCreditHistoryAll = (serviceType: string = 'rider') => {
  const [data, setData] = useState<CreditHistoryAllResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Manual fetch function - called when tab is navigated to
  const fetchHistory = async (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const response = await AdminService.getAllCreditHistory(serviceType, page, pageSize);

      if (response.succeeded && response.data) {
        setData(response.data);
        setError(null);
        setHasLoadedOnce(true);
      } else {
        setError('Failed to fetch credit history');
      }
    } catch (err) {
      console.error('Error fetching credit history:', err);
      setError('Failed to fetch credit history from server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch next page
  const goToNextPage = async () => {
    if (data && data.pagination.hasNextPage) {
      await fetchHistory(currentPage + 1);
    }
  };

  // Fetch previous page
  const goToPreviousPage = async () => {
    if (data && data.pagination.hasPreviousPage) {
      await fetchHistory(Math.max(1, currentPage - 1));
    }
  };

  // Fetch specific page
  const goToPage = async (page: number) => {
    if (data && page >= 1 && page <= data.pagination.totalPages) {
      await fetchHistory(page);
    }
  };

  // Change page size and refetch
  const changePageSize = async (newSize: number) => {
    setPageSize(newSize);
    await fetchHistory(1); // Reset to first page when changing size
  };

  return {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    hasLoadedOnce,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    fetchHistory, // Manual trigger for lazy loading
  };
};
