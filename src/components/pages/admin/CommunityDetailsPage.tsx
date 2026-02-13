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
  MoreVertical,
  Layers
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
import {
  CreateCommunityModal,
  EditCommunityModal,
  InviteModal,
  CreateReportModal,
  ProfilePreviewModal
} from '../../modals';
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
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Helper function to normalize status for case-insensitive comparison
  const normalizeStatus = (status: string): string => status?.toLowerCase().trim() || '';

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
      const response = await AdminService.approveCommunity(id, {
        type: 'approve',
        reason: 'Community meets all requirements',
        notifyUser: true
      });
      
      if (response.succeeded && community) {
        setCommunity({ ...community, status: 'active' });
        setShowApproveModal(false);
        (window as any).showToast?.('success', 'Approved', 'Community has been approved successfully.');
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
      const response = await AdminService.rejectCommunity(id, {
        type: 'reject',
        reason: 'Community does not meet platform guidelines',
        notifyUser: true
      });
      
      if (response.succeeded && community) {
        setCommunity({ ...community, status: 'denied' });
        setShowRejectModal(false);
        (window as any).showToast?.('success', 'Denied', 'Community request has been denied.');
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
      const response = await AdminService.suspendCommunity(id, {
        type: 'suspend',
        reason: 'Community suspended for policy violation',
        notifyUser: true
      });
      
      if (response.succeeded && community) {
        setCommunity({ ...community, status: 'suspended' });
        setShowSuspendModal(false);
        (window as any).showToast?.('success', 'Suspended', 'Community has been suspended.');
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
      const response = await AdminService.terminateCommunity(id, {
        type: 'terminate',
        reason: 'Community permanently terminated',
        notifyUser: true
      });
      
      if (response.succeeded && community) {
        setCommunity({ ...community, status: 'terminated' });
        setShowTerminateModal(false);
        (window as any).showToast?.('success', 'Terminated', 'Community has been permanently terminated.');
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
      const response = await AdminService.reactivateCommunity(id, {
        type: 'reactivate',
        reason: 'Community has been reactivated',
        notifyUser: true
      });
      
      if (response.succeeded && community) {
        setCommunity({ ...community, status: 'active' });
        setShowReactivateModal(false);
        (window as any).showToast?.('success', 'Reactivated', 'Community has been reactivated.');
      }
    } catch (error) {
      console.error('Error reactivating community:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim() || '';
    switch (normalizedStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'disabled':
        return <Badge className="bg-red-100 text-red-800">Disabled</Badge>;
      case 'denied':
        return <Badge className="bg-gray-100 text-gray-800">Denied</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionMenuItems = () => {
    const editItem = {
      label: 'Edit Community Details',
      icon: <Settings size={16} className="text-slate-600" />,
      action: () => setShowEditModal(true)
    };

    switch (community.status.toLowerCase()) {
      case 'pending':
        return [
          editItem,
          {
            label: 'Approve Community',
            icon: <CheckCircle size={16} className="text-green-600" />,
            action: () => setShowApproveModal(true),
            variant: 'success' as const
          },
          {
            label: 'Reject Community',
            icon: <XCircle size={16} className="text-red-600" />,
            action: () => setShowRejectModal(true),
            variant: 'danger' as const
          }
        ];
      case 'active':
        return [
          editItem,
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
          editItem,
          {
            label: 'Reactivate Community',
            icon: <CheckCircle size={16} className="text-green-600" />,
            action: () => setShowReactivateModal(true),
            variant: 'success' as const
          }
        ];
      default:
        return [editItem];
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Banner */}
      {normalizeStatus(community.status) === 'pending' && (
        <div className="bg-white border-2 border-amber-200 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Pending Approval</h3>
              <p className="text-slate-500 font-medium">Review this community's details before making a decision.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
                onClick={() => setShowRejectModal(true)}
                variant="ghost" 
                className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                disabled={actionLoading}
            >
                <XCircle size={20} className="mr-2" />
                Reject
            </Button>
            <Button 
                onClick={() => setShowApproveModal(true)}
                className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-lg shadow-teal-100"
                disabled={actionLoading}
            >
                <CheckCircle size={20} className="mr-2" />
                Approve Request
            </Button>
          </div>
        </div>
      )}

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
                  {community.parentCommunityName && (
                    <div className="flex items-center gap-2 text-teal-600 font-bold">
                      <Shield size={16} />
                      Part of {community.parentCommunityName}
                    </div>
                  )}
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
          <TabTrigger value="hierarchy" className="flex items-center gap-2">
            <Layers size={16} />
            Sub-Communities
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

          {/* Match Compatibility Score */}
          <Card className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Match Compatibility</h3>
                <p className="text-sm text-slate-600">Community alignment with similar communities</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-teal-600">--</p>
                <p className="text-xs text-slate-500 font-bold uppercase">compatibility score</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-teal-100">
                <p className="text-[10px] font-black text-teal-600 uppercase mb-2">Category Match</p>
                <p className="text-2xl font-black text-slate-800">--</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-teal-100">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Location Match</p>
                <p className="text-2xl font-black text-slate-800">--</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-teal-100">
                <p className="text-[10px] font-black text-purple-600 uppercase mb-2">Size Match</p>
                <p className="text-2xl font-black text-slate-800">--</p>
              </div>
            </div>
          </Card>

          {/* Matched Communities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Matched Communities</h3>
                <p className="text-sm text-slate-600 mt-1">Similar communities based on match criteria</p>
              </div>
              <Badge className="bg-slate-100 text-slate-700 font-bold">0</Badge>
            </div>
            <div className="space-y-3">
              <div className="text-center py-12">
                <Shield size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No matched communities available</p>
                <p className="text-xs text-slate-400 mt-1">Match data will appear here once backend provides recommendations</p>
              </div>
            </div>
          </Card>

          {/* Match Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-6">Match Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-black text-blue-900 mb-1">Category Alignment</p>
                    <p className="text-sm text-blue-800">Communities are matched based on shared categories and interests</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-black text-green-900 mb-1">Geographic Proximity</p>
                    <p className="text-sm text-green-800">Communities in similar locations or regions are matched together</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-black text-purple-900 mb-1">Community Size</p>
                    <p className="text-sm text-purple-800">Similar member counts increase matching likelihood</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-black text-orange-900 mb-1">Activity Level</p>
                    <p className="text-sm text-orange-800">Communities with similar engagement patterns are recommended</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabContent>
        <TabContent value="hierarchy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {community.childCommunities && community.childCommunities.length > 0 ? (
              community.childCommunities.map((child) => (
                <Card 
                  key={child.id} 
                  className="group p-6 hover:shadow-xl transition-all border-slate-100 hover:border-teal-100 cursor-pointer"
                  onClick={() => navigate(`/admin/communities/${child.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                      <Users size={24} />
                    </div>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full font-bold text-[10px] uppercase border-none",
                      normalizeStatus(child.status) === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {child.status || 'inactive'}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 truncate" title={child.name}>{child.name}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                    {child.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Users size={14} />
                      {child.memberCount} Members
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {new Date(child.dateCreated).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase">
                        {child.privacy}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">No Sub-Communities</h3>
                <p className="text-slate-500 max-w-xs">This community doesn't have any child communities assigned yet.</p>
              </div>
            )}
          </div>
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
                    normalizeStatus(subscription.status) === 'active' ? 'bg-green-100 text-green-800' :
                    normalizeStatus(subscription.status) === 'expired' ? 'bg-red-100 text-red-800' :
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
                      normalizeStatus(payment.status) === 'completed' ? 'bg-green-100 text-green-800' :
                      normalizeStatus(payment.status) === 'pending' ? 'bg-orange-100 text-orange-800' :
                      normalizeStatus(payment.status) === 'failed' ? 'bg-red-100 text-red-800' :
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

      <EditCommunityModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        community={community}
        onSuccess={(updated) => {
          setCommunity(updated);
          setShowEditModal(false);
        }}
      />
    </div>
  );
};

export default CommunityDetailsPage;