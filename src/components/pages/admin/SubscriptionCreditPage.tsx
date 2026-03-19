import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TemplateTable, TemplateTableColumn } from './components/TemplateTable';
interface SubscriptionCreditPageProps {
  hideHeader?: boolean;
  serviceType?: 'rider' | 'seller' | 'personal-services' | 'event';
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export const SubscriptionCreditPage: React.FC<SubscriptionCreditPageProps> = ({
  hideHeader = false,
  serviceType: initialServiceType = 'rider',
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'management' | 'requests' | 'history'>('management');

  // State for service type (rider, seller, personal-services)
  const [serviceType, setServiceType] = useState<'rider' | 'seller' | 'personal-services' | 'event'>(initialServiceType);

  // State for search and filters
  const [searchUserId, setSearchUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string | boolean>('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for data
  const [riders, setRiders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [ridersLoading, setRidersLoading] = useState(false);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // State for requests and history
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  // State for modals
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notification, setNotification] = useState<Notification | null>(null);

  // Form states for modals
  const [grantForm, setGrantForm] = useState({ amount: '', reason: '' });
  const [deductForm, setDeductForm] = useState({ amount: '', reason: '' });

  // Pagination state
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10, total: 0 });

  // Service label mapping
  const serviceLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    rider: { label: 'Rider', icon: <Users size={18} /> },
    seller: { label: 'Seller', icon: <Users size={18} /> },
    'personal-services': { label: 'Service Provider', icon: <Users size={18} /> },
    event: { label: 'Event', icon: <Users size={18} /> },
  };

  const serviceLabel = serviceLabels[serviceType] || serviceLabels.rider;

  // Handler functions
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for user:', searchUserId);
  };

  const handleTableGrant = (id: string) => {
    setSearchUserId(id);
    setShowGrantModal(true);
  };

  const handleTableDeduct = (id: string) => {
    setSearchUserId(id);
    setShowDeductModal(true);
  };

  const handleTableViewHistory = (id: string) => {
    setSearchUserId(id);
    setShowCreditsModal(true);
  };

  const handleTableToggleExemption = async (id: string, isExempted: boolean, reason: string) => {
    try {
      // Implement exemption toggle logic
      console.log('Toggle exemption:', id, isExempted, reason);
      setNotification({ type: 'success', message: '✓ Exemption status updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error toggling exemption:', err);
      setNotification({ type: 'error', message: '✕ Error toggling exemption status' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onGrantSubmit = () => {
    // Implement grant logic
    console.log('Grant credits:', grantForm);
    setShowGrantModal(false);
  };

  const onDeductSubmit = () => {
    // Implement deduct logic
    console.log('Deduct credits:', deductForm);
    setShowDeductModal(false);
  };

  const approveRequest = (id: string) => {
    // Implement approve request logic
    console.log('Approve request:', id);
  };

  const rejectRequest = (id: string) => {
    // Implement reject request logic
    console.log('Reject request:', id);
  };

  const fetchRequests = () => {
    // Implement fetch requests logic
    console.log('Fetching requests');
  };

  const fetchHistory = () => {
    // Implement fetch history logic
    console.log('Fetching history');
  };

  const goToPage = (page: number) => {
    setHistoryPage(page);
  };

  const goToNextPage = () => {
    setHistoryPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    setHistoryPage((prev) => Math.max(prev - 1, 1));
  };

  const changePageSize = (size: number) => {
    setHistoryPageSize(size);
  };

  const fetchRiders = useCallback(() => {
    // Implement fetch riders logic
    setRidersLoading(true);
    // TODO: Fetch riders data
    setRidersLoading(false);
  }, []);

  const getTableColumns = (type: string): TemplateTableColumn[] => {
    if (type === 'rider') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'credits', label: 'Credits' },
      ];
    } else if (type === 'seller') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'shopName', label: 'Shop Name' },
        { key: 'email', label: 'Email' },
        { key: 'credits', label: 'Credits' },
      ];
    } else if (type === 'event') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'eventName', label: 'Event Name' },
        { key: 'organizer', label: 'Organizer' },
        { key: 'credits', label: 'Credits' },
      ];
    } else {
      return [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'credits', label: 'Credits' },
      ];
    }
  };

  const getServiceTypeLabel = () => {
    return serviceLabel.label;
  };

  const getRequestTableColumns = (type: string): TemplateTableColumn[] => {
    const baseColumns: TemplateTableColumn[] = [
      { key: 'id', label: 'Request ID' },
      { key: 'userId', label: 'User ID' },
      { key: 'userName', label: 'Name' },
      { key: 'requestedAmount', label: 'Amount Requested' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Requested Date' },
    ];

    return baseColumns;
  };

  const ridersParams = {};

  return (
    <div className="space-y-8">
      {notification && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {serviceLabel.label} Management
          </h1>
          <p className="text-gray-600 mt-1">
            Grant, deduct, and manage {serviceLabel.label.toLowerCase()} allocations
          </p>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
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
            {tab === 'management'
              ? `${getServiceTypeLabel()} Management`
              : tab === 'requests'
                ? 'Credit Requests'
                : 'History & Details'}
          </button>
        ))}
      </div>

      {/* Management Tab */}
      {activeTab === 'management' && (
        <div className="space-y-6">
          <Card className="p-4 bg-white border border-gray-200">
            <div
              className={cn(
                'grid gap-4',
                serviceType === 'rider'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              )}
            >
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Search Name/Email
                </label>
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

              {serviceType === 'rider' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Vehicle Type
                  </label>
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
              )}

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

          <TemplateTable
            data={serviceType === 'rider' ? riders : serviceType === 'seller' ? sellers : serviceType === 'event' ? [] : users}
            columns={getTableColumns(serviceType)}
            loading={
              serviceType === 'rider'
                ? ridersLoading
                : serviceType === 'seller'
                  ? sellersLoading
                  : serviceType === 'event'
                    ? false
                    : usersLoading
            }
            onGrant={handleTableGrant}
            onDeduct={handleTableDeduct}
            onViewHistory={handleTableViewHistory}
            onToggleExemption={handleTableToggleExemption}
            pagination={pagination}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <Card className="p-4 bg-white border border-gray-200">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
            </div>
          </Card>

          <TemplateTable
            data={requests}
            columns={getRequestTableColumns(serviceType)}
            loading={requestsLoading}
            onGrant={handleTableGrant}
            onDeduct={handleTableDeduct}
            onViewHistory={handleTableViewHistory}
            onToggleExemption={handleTableToggleExemption}
            pagination={pagination}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <p className="text-gray-600">Credit history for {getServiceTypeLabel().toLowerCase()}s</p>
          {/* TODO: Implement CreditHistoryAllView component */}
        </div>
      )}
    </div>
  );
};

export default SubscriptionCreditPage;
