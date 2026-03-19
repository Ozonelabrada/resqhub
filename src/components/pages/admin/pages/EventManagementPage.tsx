import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Users, FileText, Clock, Calendar, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TemplateTable, TemplateTableColumn } from '../components/TemplateTable';
import { SubscriptionModals } from '../components/SubscriptionModals';
import { AdminService } from '@/services';
import { UserRecord, CreditRequest, CreditHistory, PaginationState, TabType } from '../types/subscription';

export const EventManagementPage: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const [activeTab, setActiveTab] = useState<TabType>('management');
  const [searchQuery, setSearchQuery] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string | boolean>('');
  
  const [events, setEvents] = useState<UserRecord[]>([]);
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [history, setHistory] = useState<CreditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [managementPagination, setManagementPagination] = useState<PaginationState>({ currentPage: 1, pageSize: 10, total: 0 });
  const [requestsPagination, setRequestsPagination] = useState<PaginationState>({ currentPage: 1, pageSize: 10, total: 0 });
  
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; message: string; exempted?: boolean } | null>(null);
  const [modalContext, setModalContext] = useState<{ userId: string; userName: string; currentCredits: number } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [grantForm, setGrantForm] = useState({ amount: '', reason: '' });
  const [deductForm, setDeductForm] = useState({ amount: '', reason: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load management tab data
  useEffect(() => {
    if (activeTab === 'management') {
      setLoading(true);
      AdminService.getRidersWithCredits({
        page: managementPagination.currentPage,
        pageSize: managementPagination.pageSize,
        searchQuery: searchQuery,
        isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'active',
        serviceType: 'event',
      })
        .then((response) => {
          const data = response.data || response;
          const eventsData = data.data || [];
          const pagination = data.pagination || {};
          
          const transformedEvents: UserRecord[] = eventsData.map((event: any) => ({
            id: event.id?.toString() || event.communityId,
            name: event.eventName || event.name || `${event.firstName} ${event.lastName}`,
            email: event.email || event.organizerEmail,
            credits: event.credits?.totalCreditsRemaining || 0,
            isActive: event.isActive,
            isExempted: event.isExempted,
            accessType: event.subscriptionTier || 'free',
          }));
          
          setEvents(transformedEvents);
          setManagementPagination((prev: PaginationState) => ({
            ...prev,
            total: pagination.totalCount || eventsData.length,
          }));
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch events:', error);
          showNotification('error', 'Failed to load events');
          setLoading(false);
        });
    }
  }, [activeTab, managementPagination.currentPage, managementPagination.pageSize, searchQuery, isActiveFilter]);

  useEffect(() => {
    if (activeTab === 'requests') {
      setLoading(true);
      AdminService.getPendingCreditPurchases(requestsPagination.currentPage, requestsPagination.pageSize)
        .then((response) => {
          const data = response.data || response;
          setRequests(data.items || []);
          setRequestsPagination((prev: PaginationState) => ({ ...prev, total: data.total || (data.items?.length || 0) }));
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch credit requests:', error);
          showNotification('error', 'Failed to load credit requests');
          setLoading(false);
        });
    }
  }, [activeTab, requestsPagination.currentPage]);

  useEffect(() => {
    if (activeTab === 'history') {
      setLoading(true);
      AdminService.getAllCreditHistory('event')
        .then((response) => {
          const data = response.data || response;
          setHistory(data.items || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch credit history:', error);
          showNotification('error', 'Failed to load credit history');
          setLoading(false);
        });
    }
  }, [activeTab]);

  const handleTableGrant = (row: UserRecord) => {
    setModalContext({ userId: row.id, userName: row.name || 'Unknown', currentCredits: row.credits });
    setShowGrantModal(true);
  };

  const handleTableDeduct = (row: UserRecord) => {
    setModalContext({ userId: row.id, userName: row.name || 'Unknown', currentCredits: row.credits });
    setShowDeductModal(true);
  };

  const handleTableViewHistory = (row: UserRecord) => {
    setModalContext({ userId: row.id, userName: row.name || 'Unknown', currentCredits: row.credits });
    setShowViewModal(true);
  };

  const handleTableToggleExemption = (row: UserRecord) => {
    const targetExempted = !row.isExempted; // Opposite of current state
    setConfirmAction({
      type: 'toggle-exemption',
      id: row.id,
      message: `${row.isExempted ? 'Remove exemption' : 'Exempt'} ${row.name || 'this event'}?`,
      exempted: targetExempted,
    });
    setShowConfirmDialog(true);
  };

  const onGrantSubmit = async () => {
    if (!modalContext || !grantForm.amount) {
      showNotification('error', 'Please fill in all fields');
      return;
    }
    setModalLoading(true);
    try {
      await AdminService.grantCreditsToUser({
        userId: modalContext.userId,
        creditsToGrant: parseInt(grantForm.amount),
        creditValue: 1,
        reason: grantForm.reason || 'Admin grant',
        serviceType: 'event',
      });
      showNotification('success', `✓ Credits granted to ${modalContext.userName}`);
      setShowGrantModal(false);
      setGrantForm({ amount: '', reason: '' });
      setModalContext(null);
      // Refresh events data
      const response = await AdminService.getRidersWithCredits({
        page: managementPagination.currentPage,
        pageSize: managementPagination.pageSize,
        serviceType: 'event',
      });
      const data = response.data || response;
      const eventsData = data.data || [];
      const pagination = data.pagination || {};
      
      const transformedEvents: UserRecord[] = eventsData.map((event: any) => ({
        id: event.id?.toString() || event.communityId,
        name: event.eventName || event.name || `${event.firstName} ${event.lastName}`,
        email: event.email || event.organizerEmail,
        credits: event.credits?.totalCreditsRemaining || 0,
        isActive: event.isActive,
        isExempted: event.isExempted,
      }));
      
      setEvents(transformedEvents);
      setManagementPagination((prev: PaginationState) => ({
        ...prev,
        total: pagination.totalCount || eventsData.length,
      }));
    } catch (error) {
      showNotification('error', 'Failed to grant credits');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const onDeductSubmit = async () => {
    if (!modalContext || !deductForm.amount) {
      showNotification('error', 'Please fill in all fields');
      return;
    }
    setModalLoading(true);
    try {
      await AdminService.deductCreditsFromUser({
        userId: modalContext.userId,
        creditsToDeduct: parseInt(deductForm.amount),
        reason: deductForm.reason || 'Admin deduct',
        serviceType: 'event',
      });
      showNotification('success', `✓ Credits deducted from ${modalContext.userName}`);
      setShowDeductModal(false);
      setDeductForm({ amount: '', reason: '' });
      setModalContext(null);
      // Refresh events data
      const response = await AdminService.getRidersWithCredits({
        page: managementPagination.currentPage,
        pageSize: managementPagination.pageSize,
        serviceType: 'event',
      });
      const data = response.data || response;
      const eventsData = data.data || [];
      const pagination = data.pagination || {};
      
      const transformedEvents: UserRecord[] = eventsData.map((event: any) => ({
        id: event.id?.toString() || event.communityId,
        name: event.eventName || event.name || `${event.firstName} ${event.lastName}`,
        email: event.email || event.organizerEmail,
        credits: event.credits?.totalCreditsRemaining || 0,
        isActive: event.isActive,
        isExempted: event.isExempted,
      }));
      
      setEvents(transformedEvents);
      setManagementPagination((prev: PaginationState) => ({
        ...prev,
        total: pagination.totalCount || eventsData.length,
      }));
    } catch (error) {
      showNotification('error', 'Failed to deduct credits');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setModalLoading(true);
    try {
      if (confirmAction.type === 'toggle-exemption') {
        // Get current event to check if exemption state truly needs to change
        const currentEvent = events.find(e => e.id === confirmAction.id);
        if (currentEvent && currentEvent.isExempted !== confirmAction.exempted) {
          // Only toggle if state needs to change
          await AdminService.toggleEventExemption(confirmAction.id);
        }
      }
      showNotification('success', 'Action completed');
      setShowConfirmDialog(false);
      setConfirmAction(null);
      // Refresh events data
      const response = await AdminService.getRidersWithCredits({
        page: managementPagination.currentPage,
        pageSize: managementPagination.pageSize,
        serviceType: 'event',
      });
      const data = response.data || response;
      const eventsData = data.data || [];
      const pagination = data.pagination || {};
      
      const transformedEvents: UserRecord[] = eventsData.map((event: any) => ({
        id: event.id?.toString() || event.communityId,
        name: event.eventName || event.name || `${event.firstName} ${event.lastName}`,
        email: event.email || event.organizerEmail,
        credits: event.credits?.totalCreditsRemaining || 0,
        isActive: event.isActive,
        isExempted: event.isExempted,
      }));
      
      setEvents(transformedEvents);
      setManagementPagination((prev: PaginationState) => ({
        ...prev,
        total: pagination.totalCount || eventsData.length,
      }));
    } catch (error) {
      showNotification('error', 'Action failed');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const eventColumns: TemplateTableColumn[] = [
    { key: 'name', label: 'Event Name' },
    { key: 'email', label: 'Organizer' },
    { key: 'credits', label: 'Credits' },
    {
      key: 'accessType',
      label: 'Access',
      render: (row: UserRecord) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.accessType?.toLowerCase() === 'premium' || row.accessType?.toLowerCase().includes('premium')
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.accessType?.toLowerCase().includes('premium') ? 'Premium' : 'Free'}
        </span>
      ),
    },
  ];

  const eventActions = [
    { key: 'grant', label: 'Grant', onClick: handleTableGrant, className: 'text-blue-600 hover:text-blue-700 font-medium' },
    { key: 'deduct', label: 'Deduct', onClick: handleTableDeduct, className: 'text-red-600 hover:text-red-700 font-medium' },
    { key: 'history', label: 'History', onClick: handleTableViewHistory, className: 'text-gray-600 hover:text-gray-700 font-medium' },
    { key: 'exempt', label: (row: UserRecord) => row.isExempted ? 'Set Premium' : 'Set Free', onClick: handleTableToggleExemption, className: 'text-yellow-600 hover:text-yellow-700 font-medium' },
  ];

  const eventToolbar = (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">Search</label>
          <Input
            placeholder="Event name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">Status</label>
          <select
            value={isActiveFilter === '' ? '' : isActiveFilter ? 'true' : 'false'}
            onChange={(e) => setIsActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setIsActiveFilter('');
            }}
            className="w-full rounded-lg border-gray-300"
          >
            ↻ Reset
          </Button>
        </div>
      </div>
    </div>
  );

  const requestColumns: TemplateTableColumn[] = [
    { key: 'id', label: 'Request ID' },
    { key: 'userId', label: 'Event ID' },
    { key: 'userName', label: 'Event Name' },
    { key: 'requestedAmount', label: 'Amount' },
    { key: 'reason', label: 'Reason' },
  ];

  const requestActions = [
    { key: 'approve', label: 'Approve', onClick: (row: CreditRequest) => { setConfirmAction({ type: 'approve-request', id: row.id, message: 'Approve this request?' }); setShowConfirmDialog(true); }, className: 'text-green-600' },
    { key: 'reject', label: 'Reject', onClick: (row: CreditRequest) => { setConfirmAction({ type: 'reject-request', id: row.id, message: 'Reject this request?' }); setShowConfirmDialog(true); }, className: 'text-red-600' },
  ];

  return (
    <div className="space-y-8">
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {!hideHeader && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="text-gray-600 mt-1">Manage event credit allocations and subscriptions</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{managementPagination.total}</p>
                </div>
                <Users className="text-purple-300 opacity-50" size={32} />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{requestsPagination.total}</p>
                </div>
                <TrendingUp className="text-green-300 opacity-50" size={32} />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">History Records</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{history.length}</p>
                </div>
                <Zap className="text-yellow-300 opacity-50" size={32} />
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b-2 border-gray-200 bg-white rounded-t-lg shadow-sm">
        {['management', 'requests', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={cn('px-6 py-4 font-semibold flex items-center gap-2 transition-all border-b-4 -mb-0.5', activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50')}
          >
            {tab === 'management' && <Users size={18} />}
            {tab === 'requests' && <FileText size={18} />}
            {tab === 'history' && <Clock size={18} />}
            <span>{tab === 'management' ? 'Event Management' : tab === 'requests' ? 'Credit Requests' : 'History & Details'}</span>
          </button>
        ))}
      </div>

      {activeTab === 'management' && (
        <div className="space-y-6">
          <TemplateTable
            header={{ title: 'Event Management', description: 'Grant, deduct, and manage event credit allocations' }}
            columns={eventColumns}
            data={events}
            actions={eventActions}
            toolbar={eventToolbar}
            loading={loading}
            empty={{ title: 'No events found', description: 'Try adjusting your filters or search terms' }}
            pagination={managementPagination}
            onPageChange={(page: number) => setManagementPagination((prev: PaginationState) => ({ ...prev, currentPage: page }))}
          />
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <TemplateTable
            header={{ title: 'Event Credit Requests', description: 'View and manage credit requests from events' }}
            columns={requestColumns}
            data={requests}
            actions={requestActions}
            loading={loading}
            empty={{ title: 'No requests found', description: 'No pending credit requests at this time' }}
            pagination={requestsPagination}
            onPageChange={(page: number) => setRequestsPagination((prev: PaginationState) => ({ ...prev, currentPage: page }))}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Credit History</h2>
            {loading ? (
              <div className="text-center py-8">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No history available</div>
            ) : (
              <div className="space-y-2">
                {history.map(record => (
                  <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{record.userName}</p>
                        <p className="text-sm text-gray-600">{record.actionType}: {record.amount} credits</p>
                        <p className="text-xs text-gray-500">{record.reason}</p>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <SubscriptionModals
        showGrantModal={showGrantModal}
        closeGrantModal={() => {
          setShowGrantModal(false);
          setModalContext(null);
          setGrantForm({ amount: '', reason: '' });
        }}
        showDeductModal={showDeductModal}
        closeDeductModal={() => {
          setShowDeductModal(false);
          setModalContext(null);
          setDeductForm({ amount: '', reason: '' });
        }}
        showViewModal={showViewModal}
        closeViewModal={() => {
          setShowViewModal(false);
          setModalContext(null);
        }}
        showConfirmDialog={showConfirmDialog}
        closeConfirmDialog={() => {
          setShowConfirmDialog(false);
          setConfirmAction(null);
        }}
        modalContext={modalContext}
        modalLoading={modalLoading}
        grantForm={grantForm}
        setGrantForm={setGrantForm}
        deductForm={deductForm}
        setDeductForm={setDeductForm}
        confirmAction={confirmAction}
        onGrantSubmit={onGrantSubmit}
        onDeductSubmit={onDeductSubmit}
        handleConfirm={handleConfirm}
        historyData={history}
      />
    </div>
  );
};
