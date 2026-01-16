import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  Shield,
  MapPin,
  Settings,
  BarChart3,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import {
  Card,
  Button,
  Spinner,
  Badge,
  Avatar,
  Tabs,
  TabList,
  TabTrigger,
  TabContent
} from '../../ui';
import { AdminConfirmModal } from '../../ui/admin';
import { cn } from '@/lib/utils';
import { AdminService } from '@/services';
import type { CommunityDetail, Subscription, Payment } from '@/types';

const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  useEffect(() => {
    if (id) {
      loadCommunityDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionDropdown && !(event.target as Element).closest('.action-dropdown')) {
        setShowActionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionDropdown]);

  const loadCommunityDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);

      const [communityData, subscriptionsData, paymentsData] = await Promise.all([
        AdminService.getCommunityDetail(id),
        AdminService.getCommunitySubscriptions(id),
        AdminService.getCommunityPayments(id)
      ]);

      setCommunity(communityData);
      
      // Handle potential wrapped or raw array responses
      const subs = Array.isArray(subscriptionsData) ? subscriptionsData : (subscriptionsData?.items || []);
      const pays = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.items || []);
      
      setSubscriptions(subs);
      setPayments(pays);
    } catch (error) {
      console.error('Error loading community details:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">Community not found</h2>
        <Button variant="link" onClick={() => navigate('/admin/communities')} className="mt-4">
          Back to Communities
        </Button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      const success = await AdminService.approveCommunity(id, {
        type: 'approve',
        reason: 'Community meets all requirements',
        notifyUser: true
      });
      
      if (success && community) {
        setCommunity({ ...community, status: 'active' });
        setShowApproveModal(false);
      }
    } catch (error) {
      console.error('Error approving community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      const success = await AdminService.rejectCommunity(id, {
        type: 'reject',
        reason: 'Community does not meet platform guidelines',
        notifyUser: true
      });
      
      if (success && community) {
        setCommunity({ ...community, status: 'rejected' });
        setShowRejectModal(false);
      }
    } catch (error) {
      console.error('Error rejecting community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      const success = await AdminService.suspendCommunity(id, {
        type: 'suspend',
        reason: 'Community suspended for policy violation',
        notifyUser: true
      });
      
      if (success && community) {
        setCommunity({ ...community, status: 'suspended' });
        setShowSuspendModal(false);
      }
    } catch (error) {
      console.error('Error suspending community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      const success = await AdminService.terminateCommunity(id, {
        type: 'terminate',
        reason: 'Community permanently terminated',
        notifyUser: true
      });
      
      if (success && community) {
        setCommunity({ ...community, status: 'terminated' });
        setShowTerminateModal(false);
      }
    } catch (error) {
      console.error('Error terminating community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      const success = await AdminService.reactivateCommunity(id, {
        type: 'reactivate',
        reason: 'Community has been reactivated',
        notifyUser: true
      });
      
      if (success && community) {
        setCommunity({ ...community, status: 'active' });
        setShowReactivateModal(false);
      }
    } catch (error) {
      console.error('Error reactivating community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'disabled':
        return <Badge className="bg-red-100 text-red-800">Disabled</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionMenuItems = () => {
    switch (community.status) {
      case 'pending':
        return [
          {
            label: 'Approve Community',
            icon: <CheckCircle size={16} className="text-green-600" />,
            action: () => setShowApproveModal(true),
            variant: 'success' as const
          }
        ];
      case 'active':
        return [
          {
            label: 'Suspend Community',
            icon: <AlertTriangle size={16} className="text-yellow-600" />,
            action: () => setShowSuspendModal(true),
            variant: 'warning' as const
          },
          {
            label: 'Terminate Community',
            icon: <XCircle size={16} className="text-red-600" />,
            action: () => setShowTerminateModal(true),
            variant: 'danger' as const
          }
        ];
      case 'terminated':
        return [
          {
            label: 'Reactivate Community',
            icon: <CheckCircle size={16} className="text-green-600" />,
            action: () => setShowReactivateModal(true),
            variant: 'success' as const
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Community Header summary card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Community Image */}
          <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
            {community.name.charAt(0)}
          </div>

          {/* Community Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-slate-900">{community.name}</h2>
                  {getStatusBadge(community.status)}
                </div>
                <p className="text-slate-600 mb-3">{community.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {community.membersCount} members
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    {community.postsCount} posts
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Created {new Date(community.createdAt).toLocaleDateString()}
                  </div>
                  {community.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {community.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative action-dropdown">
                <Button
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 font-bold gap-2 px-4 py-2"
                >
                  <MoreVertical size={16} />
                  Actions
                  <ChevronDown size={14} className={cn(
                    "transition-transform duration-200",
                    showActionDropdown && "rotate-180"
                  )} />
                </Button>

                {showActionDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                    {getActionMenuItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setShowActionDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        {item.icon}
                        <span className="font-medium text-slate-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList className="border-b border-slate-200">
          <TabTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Overview
          </TabTrigger>
          <TabTrigger value="members" className="flex items-center gap-2">
            <Users size={16} />
            Members
          </TabTrigger>
          <TabTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard size={16} />
            Subscriptions
          </TabTrigger>
          <TabTrigger value="payments" className="flex items-center gap-2">
            <DollarSign size={16} />
            Payments
          </TabTrigger>
          <TabTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabTrigger>
        </TabList>

        {/* Overview Tab */}
        <TabContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Total Members</p>
                  <p className="text-2xl font-black text-blue-600">{community.statistics?.totalMembers || community.membersCount || 0}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Average engagement: {community.statistics?.engagementRate || 0}%
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Total Posts</p>
                  <p className="text-2xl font-black text-green-600">{community.statistics?.totalPosts || community.postsCount || 0}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                {community.statistics?.avgPostsPerDay || 0} posts/day average
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Reports</p>
                  <p className="text-2xl font-black text-orange-600">{community.statistics?.totalReports || community.reportsCount || 0}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Community reports filed</p>
            </Card>
          </div>

          {/* Community Rules */}
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Community Rules</h3>
            <div className="space-y-2">
              {community.rules?.map((rule, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-slate-700">{rule}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Community Features */}
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Enabled Features</h3>
            {community.features && community.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {community.features.map((feature) => (
                  <div
                    key={feature.code}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        feature.isActive ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <div>
                        <p className="font-bold text-slate-900">{feature.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{feature.code}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "font-bold",
                      feature.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    )}>
                      {feature.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium">No features enabled for this community</p>
              </div>
            )}
          </Card>
        </TabContent>

        {/* Members Tab */}
        <TabContent value="members" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Moderators</h3>
            <div className="space-y-3">
              {community.moderators?.map((moderator) => (
                <div key={moderator.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Avatar className="w-10 h-10 bg-blue-100">
                    {moderator.name.charAt(0)}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{moderator.name}</p>
                    <p className="text-sm text-slate-600">@{moderator.username}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-600">Moderator</Badge>
                </div>
              ))}
              {(!community.moderators || community.moderators.length === 0) && (
                <p className="text-center py-4 text-slate-400 font-medium italic">No moderators assigned</p>
              )}
            </div>
          </Card>
        </TabContent>

        {/* Subscriptions Tab */}
        <TabContent value="subscriptions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Active Subscriptions</h3>
            <div className="space-y-3">
              {subscriptions?.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-900">{subscription.planName}</p>
                    <p className="text-sm text-slate-600">
                      {subscription.subscribersCount} subscribers • ${subscription.monthlyRevenue}/month
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={cn(
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  )}>
                    {subscription.status}
                  </Badge>
                </div>
              ))}
              {(!subscriptions || subscriptions.length === 0) && (
                <p className="text-center py-8 text-slate-400 font-medium italic">No active subscriptions found</p>
              )}
            </div>
          </Card>
        </TabContent>

        {/* Payments Tab */}
        <TabContent value="payments" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Payment History</h3>
            <div className="space-y-3">
              {payments?.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-900">${payment.amount} {payment.currency}</p>
                    <p className="text-sm text-slate-600">{payment.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.date).toLocaleDateString()} • {payment.payer.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={cn(
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    )}>
                      {payment.status}
                    </Badge>
                    {payment.invoiceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(payment.invoiceUrl, '_blank')}
                        className="mt-1 text-xs"
                      >
                        View Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!payments || payments.length === 0) && (
                <p className="text-center py-8 text-slate-400 font-medium italic">No payment history available</p>
              )}
            </div>
          </Card>
        </TabContent>

        {/* Settings Tab */}
        <TabContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Community Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="font-bold text-slate-900 mb-2">Visibility</p>
                <Badge className="bg-blue-100 text-blue-800">{community.settings?.visibility || 'N/A'}</Badge>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-2">Join Policy</p>
                <Badge className="bg-purple-100 text-purple-800">{community.settings?.joinPolicy || 'N/A'}</Badge>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-2">Moderation</p>
                <Badge className="bg-green-100 text-green-800">{community.settings?.moderationPolicy || 'N/A'}</Badge>
              </div>
            </div>
          </Card>
        </TabContent>
      </Tabs>

      {/* Confirmation Modals */}
      <AdminConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Community"
        message={`Are you sure you want to approve "${community.name}"? This will make it visible to all users.`}
        confirmText="Approve"
        variant="success"
        loading={actionLoading}
      />

      <AdminConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Community"
        message={`Are you sure you want to reject "${community.name}"? This action cannot be undone.`}
        confirmText="Reject"
        variant="danger"
        loading={actionLoading}
      />

      <AdminConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title="Suspend Community"
        message={`Are you sure you want to suspend "${community.name}"? The community will be temporarily disabled but can be reactivated later.`}
        confirmText="Suspend"
        variant="warning"
        loading={actionLoading}
      />

      <AdminConfirmModal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminate}
        title="Terminate Community"
        message={`Are you sure you want to permanently terminate "${community.name}"? This action cannot be undone and will permanently disable the community.`}
        confirmText="Terminate"
        variant="danger"
        loading={actionLoading}
      />

      <AdminConfirmModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={handleReactivate}
        title="Reactivate Community"
        message={`Are you sure you want to reactivate "${community.name}"? The community will be restored to active status.`}
        confirmText="Reactivate"
        variant="success"
        loading={actionLoading}
      />
    </div>
  );
};

export default CommunityDetailsPage;