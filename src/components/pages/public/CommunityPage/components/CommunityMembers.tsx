import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { ProfilePreviewModal, AddVolunteerModal } from '@/components/modals';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  UserCheck,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Loader2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember, JoinRequest } from '@/types/community';
import { MessagesService } from '@/services/messagesService';
import { CommunityService } from '@/services/communityService';
import { toast } from 'react-hot-toast';
import api from '@/api/client';

// Import new extracted components and hooks
import { useStoreList } from '@/hooks/admin/useStoreList';
import { useStoreDetail } from '@/hooks/admin/useStoreDetail';
import { useStoreAction } from '@/hooks/admin/useStoreAction';
import { useMemberCounts } from '@/hooks/admin/useMemberCounts';
import { StoreDetailModal } from './StoreDetailModal';
import { StoreActionConfirmModal } from './StoreActionConfirmModal';
import MembersGrid from './MembersGrid';
import JoinRequestsGrid from './JoinRequestsGrid';
import VolunteersGrid from './VolunteersGrid';
import StoresGrid from './StoresGrid';

interface CommunityMembersProps {
  members: CommunityMember[];
  joinRequests?: JoinRequest[];
  isAdmin?: boolean;
  isModerator?: boolean;
  communityId?: string | number;
  onApprove?: (requestId: number, userId: string) => Promise<boolean>;
  onReject?: (requestId: number, userId: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export const CommunityMembers: React.FC<CommunityMembersProps> = ({ 
  members, 
  joinRequests = [],
  isAdmin,
  isModerator,
  communityId,
  onApprove,
  onReject,
  onRefresh
}) => {
  const navigate = useNavigate();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member' | 'seller'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'requests' | 'volunteers' | 'sellers'>('members');
  const [activeSellerSubTab, setActiveSellerSubTab] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<CommunityMember[]>([]);
  const [isAddVolunteerModalOpen, setIsAddVolunteerModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  // Custom Hooks
  const { stores, statusCounts: storeStatusCounts, loading: storesLoading, fetchByStatus: fetchStoresByStatus } = useStoreList(communityId as string);
  const { detail: storeDetail, loading: storeDetailLoading, fetch: fetchStoreDetail } = useStoreDetail(communityId as string);
  const { actionLoading: storeActionLoading, modal: actionModal, reason: actionReason, execute: executeAction, openModal: openActionModal, closeModal: closeActionModal, setReason: setActionReason } = useStoreAction(communityId as string);
  const { memberCounts, fetchMemberCounts } = useMemberCounts();

  const isPrivileged = isAdmin || isModerator;
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Initialize member counts
  useEffect(() => {
    if (communityId) {
      fetchMemberCounts(communityId as string | number);
    }
  }, [communityId, fetchMemberCounts]);

  // Fetch stores when sellers tab is active
  useEffect(() => {
    if (activeSubTab === 'sellers' && communityId) {
      const statusMap: Record<string, string> = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        suspended: 'Suspended'
      };
      fetchStoresByStatus(statusMap[activeSellerSubTab || 'pending']);
    }
  }, [activeSubTab, activeSellerSubTab, communityId, fetchStoresByStatus]);

  // Split members into approved and pending based on memberIsApproved flag
  const approvedMembers = members.filter(m => m.memberIsApproved === true);
  const pendingMembers = members.filter(m => m.memberIsApproved === false);

  const filteredMembers = approvedMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'seller') {
      const memberRoles = (member.roles || [member.role]) as any[];
      return matchesSearch && memberRoles.includes('seller');
    }
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Combine pending members from API with those who have memberIsApproved = false
  const allPendingRequests = [
    ...joinRequests.filter(req => req.status === 'Pending'),
    ...pendingMembers.map(member => ({
      id: parseInt(member.id) || Math.random(),
      userId: member.id,
      userName: member.username,
      userFullName: member.name,
      userEmail: undefined,
      userPhone: undefined,
      userAddress: undefined,
      userAge: undefined,
      userSex: undefined,
      userLocation: undefined,
      requestMessage: undefined,
      verificationStatus: undefined,
      profilePictureUrl: member.profilePicture,
      communityId: 0,
      dateCreated: member.joinedAt,
      status: 'Pending' as const
    }))
  ];
  const pendingRequests = allPendingRequests;

  // Handle store action with fresh detail fetch
  const handleProcessStoreAction = async (action: 'approve' | 'reject' | 'suspend' | 'reopen') => {
    if (!communityId || !storeDetail?.storeId) return;
    
    const success = await executeAction(storeDetail.storeId, action, actionReason);
    if (success) {
      await fetchStoreDetail(storeDetail.storeId);
      closeActionModal();
      
      // Refresh store list
      if (activeSubTab === 'sellers' && activeSellerSubTab) {
        const statusMap: Record<string, string> = {
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          suspended: 'Suspended'
        };
        await fetchStoresByStatus(statusMap[activeSellerSubTab]);
      }
    }
  };

  // Member Request Handlers
  const handleApprove = async (requestId: number, userId: string) => {
    if (!onApprove) return;
    setProcessingId(requestId);
    try {
      const success = await onApprove(requestId, userId);
      if (success) toast.success('Member approved successfully');
      else toast.error('Failed to approve member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number, userId: string) => {
    if (!onReject) return;
    setProcessingId(requestId);
    try {
      const success = await onReject(requestId, userId);
      if (success) toast.success('Join request rejected');
      else toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectChat = async (userId: string, userName: string) => {
    try {
      const message = `Halo ${userName}, I'm an admin from the community.`;
      const result = await MessagesService.sendMessage({
        directMessageReceiverId: userId,
        content: message,
        isGroupMessage: false
      });
      if (result) {
        toast.success('Conversation started');
        navigate('/messages');
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleAddVolunteer = async (newVolunteers: CommunityMember[]) => {
    try {
      if (!communityId) {
        toast.error('Community ID is missing');
        return;
      }
      const userIds = newVolunteers.map(m => m.id);
      const success = await CommunityService.addVolunteersToCommunity(communityId, userIds);
      if (success) {
        setVolunteers([...volunteers, ...newVolunteers]);
        toast.success(`${newVolunteers.length} volunteer${newVolunteers.length !== 1 ? 's' : ''} added`);
      } else {
        toast.error('Failed to add volunteers');
      }
    } catch (error) {
      toast.error('Failed to add volunteers');
      console.error('Error adding volunteers:', error);
    }
  };

  const memberSellers = members.filter(m => {
    const memberRoles = (m.roles || [m.role]) as any[];
    return memberRoles.includes('seller');
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Integrated Header & Horizontal Sub-tabs */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <UserCheck className="text-teal-600" size={32} />
              Directory
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage and connect with your neighborhood community.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</p>
              <p className="text-xl font-black text-slate-900">{memberCounts.allResidents}</p>
            </div>
            {memberCounts.sellers > 0 && (
              <div className="text-center px-6 py-3 bg-teal-50 rounded-2xl border border-teal-100">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Stores</p>
                <p className="text-xl font-black text-teal-700">{memberCounts.sellers}</p>
              </div>
            )}
            {isPrivileged && memberCounts.pendingRequests > 0 && (
              <div className="text-center px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pending</p>
                <p className="text-xl font-black text-rose-700">{memberCounts.pendingRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* The "One Line" Tabs */}
        {isPrivileged && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveSubTab('members')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                activeSubTab === 'members' 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              All Residers
              <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none px-1.5 py-0 min-w-[20px] h-5">{memberCounts.allResidents}</Badge>
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                activeSubTab === 'requests' 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-100" 
                  : "text-slate-400 hover:text-rose-500"
              )}
            >
              Join Requests
              {memberCounts.pendingRequests > 0 && (
                <Badge className="bg-white text-rose-500 border-none px-1.5 py-0 min-w-[20px] h-5 shadow-sm">
                  {memberCounts.pendingRequests}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('volunteers')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                activeSubTab === 'volunteers' 
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-100" 
                  : "text-slate-400 hover:text-purple-500"
              )}
            >
              Volunteers
              <Badge className={cn(
                "border-none px-1.5 py-0 min-w-[20px] h-5",
                activeSubTab === 'volunteers'
                  ? "bg-white text-purple-500 shadow-sm"
                  : "bg-slate-200 text-slate-600"
              )}>
                {memberCounts.volunteers}
              </Badge>
            </button>
            <button
              onClick={() => setActiveSubTab('sellers')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                activeSubTab === 'sellers' 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                  : "text-slate-400 hover:text-emerald-500"
              )}
            >
              Stores
              <Badge className={cn(
                "border-none px-1.5 py-0 min-w-[20px] h-5",
                activeSubTab === 'sellers'
                  ? "bg-white text-emerald-500 shadow-sm"
                  : "bg-slate-200 text-slate-600"
              )}>
                {memberCounts.sellers}
              </Badge>
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'members' && isPrivileged && (
        <MembersGrid
          members={approvedMembers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onDirectChat={handleDirectChat}
          onViewProfile={(userId) => {
            setSelectedUserId(userId);
            setIsProfilePreviewOpen(true);
          }}
        />
      )}

      {activeSubTab === 'requests' && isPrivileged && (
        <JoinRequestsGrid
          requests={pendingRequests}
          processingId={processingId}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewProfile={(userId) => {
            setSelectedUserId(userId);
            setIsProfilePreviewOpen(true);
          }}
        />
      )}

      {activeSubTab === 'volunteers' && isPrivileged && (
        <VolunteersGrid
          volunteers={volunteers}
          onDirectChat={handleDirectChat}
          onViewProfile={(userId) => {
            setSelectedUserId(userId);
            setIsProfilePreviewOpen(true);
          }}
          onAddVolunteer={() => setIsAddVolunteerModalOpen(true)}
          isEmpty={volunteers.length === 0}
        />
      )}

      {activeSubTab === 'sellers' && isPrivileged && (
        <StoresGrid
          stores={stores}
          isLoading={storesLoading}
          activeTab={activeSellerSubTab}
          statusCounts={storeStatusCounts}
          onViewDetails={async (store) => {
            setSelectedStore(store);
            await fetchStoreDetail(store.storeId);
          }}
          onTabChange={setActiveSellerSubTab}
        />
      )}

      {/* Store Detail Modal - Refactored */}
      <StoreDetailModal
        isOpen={selectedStore !== null}
        store={selectedStore}
        storeDetail={storeDetail}
        isLoading={storeDetailLoading}
        onClose={() => setSelectedStore(null)}
        onActionClick={(actionType) => openActionModal(actionType)}
        actionMenuOpen={actionMenuOpen}
        onActionMenuToggle={setActionMenuOpen}
        activeSellerSubTab={activeSellerSubTab}
      />

      {/* Store Action Confirmation Modal - Refactored */}
      <StoreActionConfirmModal
        isOpen={actionModal.open}
        actionType={actionModal.type}
        storeName={storeDetail?.storeName}
        reason={actionReason}
        isLoading={storeActionLoading}
        onConfirm={() => handleProcessStoreAction(actionModal.type as 'approve' | 'reject' | 'suspend' | 'reopen')}
        onCancel={closeActionModal}
        onReasonChange={setActionReason}
      />

      <ProfilePreviewModal 
        isOpen={isProfilePreviewOpen}
        onClose={() => {
          setIsProfilePreviewOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId || undefined}
        user={selectedUserProfile}
      />

      {/* Add Volunteer Modal */}
      <AddVolunteerModal 
        isOpen={isAddVolunteerModalOpen}
        onClose={() => setIsAddVolunteerModalOpen(false)}
        communityId={communityId || ''}
        existingVolunteers={volunteers}
        onAddVolunteer={handleAddVolunteer}
      />
    </div>
  );
};
