import { useState, useCallback } from 'react';
import { AdminService } from '@/services';

export interface RiderData {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  vehicle: string;
  rating: number;
  totalCompletedRides: number;
  cancelledRides: number;
  approvalStatus: string;
  isActive: boolean;
  credits: {
    totalCredits: number;
    creditCount: number;
    totalValue: string;
    canAcceptBookings: boolean;
  };
}

export interface RidersResponse {
  data: RiderData[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface FetchParams {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  vehicle?: string;
  minRating?: number;
  maxRating?: number;
  isActive?: boolean;
}

export const useRidersList = (serviceType?: string) => {
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiders = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminService.getRidersWithCredits({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        searchQuery: params.searchQuery,
        vehicle: params.vehicle,
        minRating: params.minRating,
        maxRating: params.maxRating,
        isActive: params.isActive,
      });

      if (response.succeeded && response.data) {
        setRiders(response.data.data || []);
        setPagination(response.data.pagination || {
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        });
      } else {
        setError(response.message || 'Failed to fetch riders');
      }
    } catch (err: any) {
      console.error('Error fetching riders:', err);
      setError(err?.message || 'Error fetching riders');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    riders,
    pagination,
    loading,
    error,
    fetchRiders,
  };
};
