import { useState, useCallback, useMemo, useEffect } from 'react';
import { ServiceType, PaginationState, UserRecord, CreditRequest, CreditHistory, Notification } from '../types/subscription';
import { generateMockData, generateMockRequests, generateMockHistory } from '../utils/subscriptionMockData';

export const useSubscriptionManagement = (serviceType: ServiceType) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string | boolean>('');

  const [data, setData] = useState<Record<ServiceType, UserRecord[]>>({
    rider: [],
    seller: [],
    'personal-services': [],
    event: [],
  });

  const [managementLoading, setManagementLoading] = useState(false);
  const [managementError, setManagementError] = useState<string | null>(null);

  const [paginationState, setPaginationState] = useState<Record<ServiceType, PaginationState>>({
    rider: { currentPage: 1, pageSize: 10, total: 0 },
    seller: { currentPage: 1, pageSize: 10, total: 0 },
    'personal-services': { currentPage: 1, pageSize: 10, total: 0 },
    event: { currentPage: 1, pageSize: 10, total: 0 },
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  // Reset filters when service type changes
  useEffect(() => {
    setSearchQuery('');
    setVehicleFilter('');
    setIsActiveFilter('');
  }, [serviceType]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchManagementData = useCallback(async () => {
    setManagementLoading(true);
    setManagementError(null);
    try {
      const mockData = generateMockData(serviceType);
      setData(prev => ({
        ...prev,
        [serviceType]: mockData
      }));

      setPaginationState(prev => ({
        ...prev,
        [serviceType]: {
          currentPage: 1,
          pageSize: 10,
          total: mockData.length,
        },
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
      setManagementError(errorMsg);
      showNotification('error', `Error loading ${serviceType} data: ${errorMsg}`);
    } finally {
      setManagementLoading(false);
    }
  }, [serviceType]);

  const currentPagination = useMemo(
    () => paginationState[serviceType],
    [serviceType, paginationState]
  );

  return {
    searchQuery,
    setSearchQuery,
    vehicleFilter,
    setVehicleFilter,
    isActiveFilter,
    setIsActiveFilter,
    data,
    setData,
    managementLoading,
    managementError,
    paginationState,
    setPaginationState,
    notification,
    showNotification,
    fetchManagementData,
    currentPagination,
  };
};

export const useSubscriptionRequests = (serviceType: ServiceType) => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsPagination, setRequestsPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  // Reset search when service type changes
  useEffect(() => {
    setRequestsSearch('');
    setRequestsPagination({ currentPage: 1, pageSize: 10, total: 0 });
  }, [serviceType]);

  const fetchRequestsData = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const mockRequests = generateMockRequests();
      setRequests(mockRequests);
      setRequestsPagination(prev => ({ ...prev, total: mockRequests.length }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch requests';
      setRequestsError(errorMsg);
    } finally {
      setRequestsLoading(false);
    }
  }, [serviceType, requestsPagination.currentPage, requestsSearch]);

  return {
    requests,
    setRequests,
    requestsLoading,
    requestsError,
    requestsSearch,
    setRequestsSearch,
    requestsPagination,
    setRequestsPagination,
    fetchRequestsData,
  };
};

export const useSubscriptionHistory = (serviceType: ServiceType) => {
  const [historyData, setHistoryData] = useState<CreditHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPagination, setHistoryPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  // Reset pagination when service type changes
  useEffect(() => {
    setHistoryPagination({ currentPage: 1, pageSize: 10, total: 0 });
  }, [serviceType]);

  const fetchHistoryData = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const mockHistory = generateMockHistory();
      setHistoryData(mockHistory);
      setHistoryPagination(prev => ({ ...prev, total: mockHistory.length }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch history';
      setHistoryError(errorMsg);
    } finally {
      setHistoryLoading(false);
    }
  }, [serviceType, historyPagination.currentPage]);

  return {
    historyData,
    setHistoryData,
    historyLoading,
    historyError,
    historyPagination,
    setHistoryPagination,
    fetchHistoryData,
  };
};
