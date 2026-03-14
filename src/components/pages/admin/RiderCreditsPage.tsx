import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Spinner,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
} from '../../ui';
import {
  Search,
  DollarSign,
  CreditCard,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminService } from '@/services';

interface CreditHistoryState {
  userId: string | null;
  history: any;
  currentCredits: any;
  selectedPlanStats: any;
  loading: boolean;
}

interface RiderCreditsPageProps {
  serviceType?: 'rider' | 'seller' | 'personal-services' | 'event';
}

const getServiceTypeLabel = (type: string): { label: string; color: string; icon: React.ReactNode } => {
  const labels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    'rider': { label: 'Rider Credits', color: 'text-blue-600', icon: <TrendingUp size={20} /> },
    'seller': { label: 'Seller Credits', color: 'text-green-600', icon: <Briefcase size={20} /> },
    'personal-services': { label: 'Personal Services Credits', color: 'text-purple-600', icon: <Users size={20} /> },
    'event': { label: 'Event Credits', color: 'text-orange-600', icon: <Calendar size={20} /> },
  };
  return labels[type] || labels['rider'];
};

const RiderCreditsPage: React.FC<RiderCreditsPageProps> = ({ serviceType = 'rider' }) => {
  const serviceLabel = getServiceTypeLabel(serviceType);
  const [activeTab, setActiveTab] = useState<'operations' | 'history' | 'statistics'>('operations');
  const [searchUserId, setSearchUserId] = useState('');
  const [creditHistoryState, setCreditHistoryState] = useState<CreditHistoryState>({
    userId: null,
    history: null,
    currentCredits: null,
    selectedPlanStats: null,
    loading: false,
  });

  // Modal states
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  const [modalLoading, setModalLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [statsPage, setStatsPage] = useState(1);

  // Form states
  const [grantForm, setGrantForm] = useState({ creditsToGrant: '', creditValue: '', reason: '' });
  const [deductForm, setDeductForm] = useState({ creditsToDeduct: '', reason: '' });
  const [grantError, setGrantError] = useState('');
  const [deductError, setDeductError] = useState('');

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError('');

    if (!searchUserId.trim() || !grantForm.creditsToGrant || !grantForm.creditValue) {
      setGrantError('Please fill in all required fields');
      return;
    }

    try {
      setModalLoading(true);
      const response = await AdminService.grantCreditsToUser({
        userId: searchUserId,
        serviceType: serviceType,
        creditsToGrant: parseInt(grantForm.creditsToGrant),
        creditValue: parseFloat(grantForm.creditValue),
        reason: grantForm.reason,
      });

      if (response.succeeded) {
        setShowGrantModal(false);
        setGrantForm({ creditsToGrant: '', creditValue: '', reason: '' });
        // Refresh history
        await loadCreditHistory(searchUserId);
        alert('Credits granted successfully!');
      } else {
        setGrantError(response.message || 'Failed to grant credits');
      }
    } catch (error: any) {
      setGrantError(error.message || 'Error granting credits');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeductCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeductError('');

    if (!searchUserId.trim() || !deductForm.creditsToDeduct) {
      setDeductError('Please fill in all required fields');
      return;
    }

    try {
      setModalLoading(true);
      const response = await AdminService.deductCreditsFromUser({
        userId: searchUserId,
        serviceType: serviceType,
        creditsToDeduct: parseInt(deductForm.creditsToDeduct),
        reason: deductForm.reason,
      });

      if (response.succeeded) {
        setShowDeductModal(false);
        setDeductForm({ creditsToDeduct: '', reason: '' });
        // Refresh history
        await loadCreditHistory(searchUserId);
        alert('Credits deducted successfully!');
      } else {
        setDeductError(response.message || 'Failed to deduct credits');
      }
    } catch (error: any) {
      setDeductError(error.message || 'Error deducting credits');
    } finally {
      setModalLoading(false);
    }
  };

  const loadCreditHistory = async (userId: string, page: number = 1) => {
    try {
      setCreditHistoryState(prev => ({ ...prev, loading: true }));
      const history = await AdminService.getUserCreditHistory(userId, serviceType, page, 20);
      setCreditHistoryState(prev => ({
        ...prev,
        userId,
        history,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading credit history:', error);
      setCreditHistoryState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadUserCurrentCredits = async (userId: string) => {
    try {
      setCreditHistoryState(prev => ({ ...prev, loading: true }));
      const credits = await AdminService.getUserCurrentCredits(userId, serviceType);
      setCreditHistoryState(prev => ({
        ...prev,
        currentCredits: credits,
        loading: false,
      }));
      setShowCreditsModal(true);
    } catch (error) {
      console.error('Error loading user credits:', error);
      setCreditHistoryState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadPlanStatistics = async (planId: string) => {
    try {
      setCreditHistoryState(prev => ({ ...prev, loading: true }));
      const stats = await AdminService.getPlanStatistics(planId);
      setCreditHistoryState(prev => ({
        ...prev,
        selectedPlanStats: stats,
        loading: false,
      }));
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error loading plan statistics:', error);
      setCreditHistoryState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      setActiveTab('history');
      loadCreditHistory(searchUserId, 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{serviceLabel.label} Management</h1>
        <p className="text-gray-600 mt-1">Grant, deduct, and manage {serviceLabel.label.toLowerCase()} allocations</p>
      </div>

      {/* Search Section */}
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('operations')}
          className={cn(
            'px-4 py-3 font-medium border-b-2 transition-colors',
            activeTab === 'operations'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} />
            Quick Operations
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-3 font-medium border-b-2 transition-colors',
            activeTab === 'history'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          <div className="flex items-center gap-2">
            <Clock size={18} />
            History & Details
          </div>
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={cn(
            'px-4 py-3 font-medium border-b-2 transition-colors',
            activeTab === 'statistics'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            Plan Statistics
          </div>
        </button>
      </div>

      {/* TAB 1: Quick Operations */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Credit Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grant Credits */}
              <Card className="p-6 border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-3 mb-4">
                  <Plus className="text-green-600" size={28} />
                  <div>
                    <h3 className="font-bold text-gray-900">Grant Credits</h3>
                    <p className="text-sm text-gray-600">Promotions, refunds, bonuses</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Award credits for welcome bonuses, promotional campaigns, or service recovery.
                </p>
                <Button
                  onClick={() => setShowGrantModal(true)}
                  disabled={!searchUserId.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus size={16} />
                  Grant Credits
                </Button>
              </Card>

              {/* Deduct Credits */}
              <Card className="p-6 border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-3 mb-4">
                  <Minus className="text-red-600" size={28} />
                  <div>
                    <h3 className="font-bold text-gray-900">Deduct Credits</h3>
                    <p className="text-sm text-gray-600">Corrections & reversals</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Remove credits for fraud corrections, duplicate transactions, or refund reversals.
                </p>
                <Button
                  onClick={() => setShowDeductModal(true)}
                  disabled={!searchUserId.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Minus size={16} />
                  Deduct Credits
                </Button>
              </Card>

              {/* View Current Credits */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="text-blue-600" size={28} />
                  <div>
                    <h3 className="font-bold text-gray-900">View Current Credits</h3>
                    <p className="text-sm text-gray-600">Active allocations</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Check user's available credits and active allocation details.
                </p>
                <Button
                  onClick={() => {
                    if (searchUserId.trim()) loadUserCurrentCredits(searchUserId);
                  }}
                  disabled={!searchUserId.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Eye size={16} />
                  View Credits
                </Button>
              </Card>

              {/* View History */}
              <Card className="p-6 border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-3 mb-4">
                  <History className="text-purple-600" size={28} />
                  <div>
                    <h3 className="font-bold text-gray-900">View Full History</h3>
                    <p className="text-sm text-gray-600">All transactions</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Access complete audit trail of purchases, allocations, and usage.
                </p>
                <Button
                  onClick={() => {
                    if (searchUserId.trim()) {
                      setActiveTab('history');
                      loadCreditHistory(searchUserId, 1);
                    }
                  }}
                  disabled={!searchUserId.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <History size={16} />
                  View History
                </Button>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: History & Details */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {creditHistoryState.loading ? (
            <Card className="p-12 text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Loading credit history...</p>
            </Card>
          ) : creditHistoryState.history ? (
            <>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Granted</p>
                  <p className="text-3xl font-bold text-green-600">
                    {creditHistoryState.history.data.statistics.totalCreditsGranted.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">credits</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Used</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {creditHistoryState.history.data.statistics.totalCreditsUsed.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">credits</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Remaining</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {creditHistoryState.history.data.statistics.totalCreditsRemaining.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">credits</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Amount Spent</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ₱{creditHistoryState.history.data.statistics.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">total</p>
                </Card>
              </div>

              {/* Purchase History */}
              <Card>
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900">Purchase History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Purchase ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditHistoryState.history.data.purchases.data.map((purchase: any, idx: number) => (
                        <tr key={purchase.purchaseId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.purchaseId}</td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">{purchase.creditsAcquired}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">₱{purchase.amountPaid.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm capitalize text-gray-600">{purchase.paymentMethod}</td>
                          <td className="px-6 py-4">
                            <Badge className="bg-green-100 text-green-800">{purchase.purchaseStatus}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(purchase.expiresAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Allocations */}
                <div className="p-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4">Active Allocations</h4>
                  <div className="space-y-3">
                    {creditHistoryState.history.data.allocations.data.map((allocation: any) => (
                      <Card key={allocation.allocationId} className="p-4 border-l-4 border-teal-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">Allocation #{allocation.allocationId}</span>
                          <Badge className={allocation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {allocation.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Allocated</p>
                            <p className="font-bold text-gray-900">{allocation.creditsAllocated}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Used</p>
                            <p className="font-bold text-orange-600">{allocation.creditsUsed}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Remaining</p>
                            <p className="font-bold text-green-600">{allocation.creditsRemaining}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Expires: {new Date(allocation.expiresAt).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 font-medium">No data loaded</p>
              <p className="text-gray-500 text-sm mt-1">Search for a user to view their credit history</p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: Plan Statistics */}
      {activeTab === 'statistics' && (
        <Card className="p-8">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Plan Statistics</h3>
            <p className="text-gray-600 mb-6">
              View revenue and distribution statistics for specific credit plans
            </p>
            <p className="text-sm text-gray-500">
              Plan statistics can be viewed from the Subscriptions → Rider Credits section
            </p>
          </div>
        </Card>
      )}

      {/* GRANT CREDITS MODAL */}
      <Dialog open={showGrantModal} onOpenChange={setShowGrantModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Credits to User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrantCredits} className="space-y-4">
            {grantError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {grantError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <Input
                type="text"
                value={searchUserId}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits to Grant *</label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={grantForm.creditsToGrant}
                onChange={(e) => setGrantForm({ ...grantForm, creditsToGrant: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Value (₱) *</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g., 99.99"
                value={grantForm.creditValue}
                onChange={(e) => setGrantForm({ ...grantForm, creditValue: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <Textarea
                placeholder="e.g., Welcome promotion, Service recovery..."
                value={grantForm.reason}
                onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGrantModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {modalLoading ? <Spinner size="sm" /> : <Plus size={16} />}
                Grant Credits
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DEDUCT CREDITS MODAL */}
      <Dialog open={showDeductModal} onOpenChange={setShowDeductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deduct Credits from User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeductCredits} className="space-y-4">
            {deductError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {deductError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <Input
                type="text"
                value={searchUserId}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits to Deduct *</label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 50"
                value={deductForm.creditsToDeduct}
                onChange={(e) => setDeductForm({ ...deductForm, creditsToDeduct: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <Textarea
                placeholder="e.g., Fraud correction, Duplicate transaction..."
                value={deductForm.reason}
                onChange={(e) => setDeductForm({ ...deductForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeductModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {modalLoading ? <Spinner size="sm" /> : <Minus size={16} />}
                Deduct Credits
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW CURRENT CREDITS MODAL */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User's Current Available Credits</DialogTitle>
          </DialogHeader>
          {creditHistoryState.currentCredits && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Total Available</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {creditHistoryState.currentCredits.data.summary.totalAvailableCredits}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-600">Active Allocations</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {creditHistoryState.currentCredits.data.summary.activeAllocations}
                  </p>
                </Card>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Allocation Breakdown</h4>
                <div className="space-y-2">
                  {creditHistoryState.currentCredits.data.allocations.map((allocation: any) => (
                    <Card key={allocation.allocationId} className="p-4 border-l-4 border-teal-500">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">Allocation #{allocation.allocationId}</span>
                        <span className="text-sm font-bold text-teal-600">{allocation.creditsRemaining} credits</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${allocation.percentageUsed}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Used: {allocation.creditsUsed}</span>
                        <span>Progress: {allocation.percentageUsed.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Expires: {new Date(allocation.expiresAt).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCreditsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Need to add History icon
const History = (props: any) => (
  <Clock {...props} />
);

const Zap = (props: any) => (
  <TrendingUp {...props} />
);

export default RiderCreditsPage;
