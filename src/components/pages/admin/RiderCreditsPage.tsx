import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, Button, Input } from '../../ui';
import { Search, Clock, Eye, TrendingUp, Users, Briefcase, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRiderCredits } from './hooks/useRiderCredits';
import { useRidersList } from './hooks/useRidersList';
import { useCreditRequests } from './hooks/useCreditRequests';
import { useCreditHistoryAll } from './hooks/useCreditHistoryAll';
import { GrantCreditsModal } from './modals/GrantCreditsModal';
import { DeductCreditsModal } from './modals/DeductCreditsModal';
import { ViewCreditsModal } from './modals/ViewCreditsModal';
import { CreditHistoryView } from './components/CreditHistoryView';
import { CreditRequestsView } from './components/CreditRequestsView';
import { CreditHistoryAllView } from './components/CreditHistoryAllView';
import { RidersTable } from './components/RidersTable';

interface RiderCreditsPageProps {
  serviceType?: 'rider' | 'seller' | 'personal-services' | 'event';
  hideHeader?: boolean;
}

const SERVICE_TYPES = {
  rider: { label: 'Rider Credits', color: 'text-blue-600', icon: <TrendingUp size={20} /> },
  seller: { label: 'Seller Credits', color: 'text-green-600', icon: <Briefcase size={20} /> },
  'personal-services': { label: 'Personal Services Credits', color: 'text-purple-600', icon: <Users size={20} /> },
  event: { label: 'Event Credits', color: 'text-orange-600', icon: <Calendar size={20} /> },
};

const RiderCreditsPage: React.FC<RiderCreditsPageProps> = ({ serviceType = 'rider', hideHeader = false }) => {
  const serviceLabel = SERVICE_TYPES[serviceType as keyof typeof SERVICE_TYPES] || SERVICE_TYPES.rider;
  const [activeTab, setActiveTab] = useState<'management' | 'requests' | 'history'>('management');
  const [searchUserId, setSearchUserId] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);

  // Riders filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [maxRating, setMaxRating] = useState<number | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    creditHistoryState,
    grantForm,
    setGrantForm,
    deductForm,
    setDeductForm,
    error,
    setError,
    modalLoading,
    loadCreditHistory,
    loadUserCurrentCredits,
    handleGrantCredits,
    handleDeductCredits,
  } = useRiderCredits(serviceType);

  const { 
    riders, 
    pagination,
    loading: ridersLoading, 
    error: ridersError,
    fetchRiders 
  } = useRidersList(serviceType);

  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    approving,
    hasLoadedOnce: requestsLoaded,
    fetchRequests,
    approveRequest,
    rejectRequest,
  } = useCreditRequests(serviceType);

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    currentPage: historyPage,
    pageSize: historyPageSize,
    hasLoadedOnce: historyLoaded,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    fetchHistory,
  } = useCreditHistoryAll(serviceType);

  // Memoize riders fetch parameters to prevent unnecessary re-renders
  const ridersParams = useMemo(() => ({
    page: currentPage,
    pageSize: 10,
    searchQuery: searchQuery || undefined,
    vehicle: vehicleFilter || undefined,
    minRating: minRating !== '' ? Number(minRating) : undefined,
    maxRating: maxRating !== '' ? Number(maxRating) : undefined,
    isActive: isActiveFilter !== '' ? Boolean(isActiveFilter) : undefined,
  }), [currentPage, searchQuery, vehicleFilter, minRating, maxRating, isActiveFilter]);

  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced fetch for riders to prevent rapid calls
  const debouncedFetchRiders = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchRiders(ridersParams);
    }, 500);
  }, [fetchRiders, ridersParams]);

  // Fetch riders when management tab opens or filters change
  useEffect(() => {
    if (activeTab === 'management') {
      debouncedFetchRiders();
    }
    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeTab, debouncedFetchRiders]);

  // Fetch requests when requests tab opens
  useEffect(() => {
    if (activeTab === 'requests' && !requestsLoaded) {
      fetchRequests();
    }
  }, [activeTab, requestsLoaded, fetchRequests]);

  // Fetch history when history tab opens
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded) {
      fetchHistory();
    }
  }, [activeTab, historyLoaded, fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      setActiveTab('history');
      loadCreditHistory(searchUserId, 1);
    }
  };

  const onGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = selectedRiderId || searchUserId;
    const success = await handleGrantCredits(userId, () => {
      setShowGrantModal(false);
      setGrantForm({ creditsToGrant: '', creditValue: '', reason: '' });
      setNotification({ type: 'success', message: '✓ Credits granted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    });
  };

  const onDeductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = selectedRiderId || searchUserId;
    const success = await handleDeductCredits(userId, () => {
      setShowDeductModal(false);
      setDeductForm({ creditsToDeduct: '', reason: '' });
      setNotification({ type: 'success', message: '✓ Credits deducted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    });
  };

  const onViewCredits = async () => {
    const userId = selectedRiderId || searchUserId;
    if (!userId.trim()) {
      setNotification({ type: 'error', message: '⚠ Please select or enter a User ID' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    try {
      await loadUserCurrentCredits(userId);
      setShowCreditsModal(true);
    } catch (err) {
      setNotification({ type: 'error', message: '✕ Failed to load user credits. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onGrantModalOpen = () => {
    setError('');
    setGrantForm({ creditsToGrant: '', creditValue: '', reason: '' });
    setShowGrantModal(true);
  };

  const onDeductModalOpen = () => {
    setError('');
    setDeductForm({ creditsToDeduct: '', reason: '' });
    setShowDeductModal(true);
  };

  // Handlers for riders table actions
  const handleTableGrant = (riderId: string) => {
    setSelectedRiderId(riderId);
    setSearchUserId(riderId);
    onGrantModalOpen();
  };

  const handleTableDeduct = (riderId: string) => {
    setSelectedRiderId(riderId);
    setSearchUserId(riderId);
    onDeductModalOpen();
  };

  const handleTableViewHistory = (riderId: string) => {
    setSelectedRiderId(riderId);
    setSearchUserId(riderId);
    setActiveTab('history');
    loadCreditHistory(riderId, 1);
  };

  return (
    <div className="space-y-8">
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{serviceLabel.label} Management</h1>
          <p className="text-gray-600 mt-1">Grant, deduct, and manage {serviceLabel.label.toLowerCase()} allocations</p>
        </div>
      )}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Enter User ID..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button
            type="submit"
            disabled={!searchUserId.trim()}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Search size={18} />
            Search User
          </Button>
        </form>
      </Card>
      <div className="flex gap-2 border-b border-gray-200">
        {['management', 'requests', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'management' | 'requests' | 'history')}
            className={cn(
              'px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer',
              activeTab === tab
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab === 'management' && <Users size={18} />}
            {tab === 'requests' && <FileText size={18} />}
            {tab === 'history' && <Clock size={18} />}
            {tab === 'management' ? 'Riders Management' : tab === 'requests' ? 'Credit Requests' : 'History & Details'}
          </button>
        ))}
      </div>
      {activeTab === 'management' && (
        <div className="space-y-6">
          {/* Riders Filter Bar */}
          <Card className="p-4 bg-white border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Query */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Search Name/Email</label>
                <Input
                  placeholder="Enter name or email..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Vehicle Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Vehicle Type</label>
                <select
                  value={vehicleFilter}
                  onChange={(e) => {
                    setVehicleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Vehicles</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                <select
                  value={isActiveFilter === '' ? '' : isActiveFilter ? 'true' : 'false'}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setIsActiveFilter('');
                    } else {
                      setIsActiveFilter(e.target.value === 'true');
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Show All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setVehicleFilter('');
                    setMinRating('');
                    setMaxRating('');
                    setIsActiveFilter('');
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Riders Table */}
          <RidersTable
            riders={riders}
            loading={ridersLoading}
            onGrant={handleTableGrant}
            onDeduct={handleTableDeduct}
            onViewHistory={handleTableViewHistory}
            pagination={pagination}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      )}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <CreditRequestsView
            requests={requests}
            loading={requestsLoading}
            onApprove={async (requestId) => {
              const result = await approveRequest(requestId);
              if (result?.success) {
                setNotification({ type: 'success', message: '✓ Request approved successfully!' });
                setTimeout(() => setNotification(null), 3000);
              } else {
                setNotification({ type: 'error', message: '✕ Failed to approve request' });
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            onReject={async (requestId) => {
              const result = await rejectRequest(requestId);
              if (result?.success) {
                setNotification({ type: 'success', message: '✓ Request rejected successfully!' });
                setTimeout(() => setNotification(null), 3000);
              } else {
                setNotification({ type: 'error', message: '✕ Failed to reject request' });
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            onApproving={approving}
          />
        </div>
      )}
      {activeTab === 'history' && (
        <CreditHistoryAllView
          data={historyData}
          loading={historyLoading}
          error={historyError}
          currentPage={historyPage}
          pageSize={historyPageSize}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
        />
      )}
      <GrantCreditsModal
        open={showGrantModal}
        onOpenChange={setShowGrantModal}
        userId={searchUserId}
        form={grantForm}
        onFormChange={(updates) => setGrantForm({ ...grantForm, ...updates })}
        onSubmit={onGrantSubmit}
        loading={modalLoading}
        error={error}
      />
      <DeductCreditsModal
        open={showDeductModal}
        onOpenChange={setShowDeductModal}
        userId={searchUserId}
        form={deductForm}
        onFormChange={(updates) => setDeductForm({ ...deductForm, ...updates })}
        onSubmit={onDeductSubmit}
        loading={modalLoading}
        error={error}
      />
      <ViewCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        data={creditHistoryState.currentCredits?.data}
      />
    </div>
  );
};

export default RiderCreditsPage;
