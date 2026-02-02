import React, { useState } from 'react';
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
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember, JoinRequest } from '@/types/community';
import { MessagesService } from '@/services/messagesService';
import { CommunityService } from '@/services/communityService';
import { toast } from 'react-hot-toast';

interface CommunityMembersProps {
  members: CommunityMember[];
  joinRequests?: JoinRequest[];
  isAdmin?: boolean;
  isModerator?: boolean;
  communityId?: string | number;
  onApprove?: (requestId: number) => Promise<boolean>;
  onReject?: (requestId: number) => Promise<boolean>;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member' | 'seller'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'requests' | 'volunteers'>('members');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<CommunityMember[]>([]);
  const [isAddVolunteerModalOpen, setIsAddVolunteerModalOpen] = useState(false);

  const isPrivileged = isAdmin || isModerator;

  // Split members into approved and pending based on memberIsApproved flag
  const approvedMembers = members.filter(m => m.memberIsApproved === true);
  const pendingMembers = members.filter(m => m.memberIsApproved === false);

  const filteredMembers = approvedMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'seller') {
      return matchesSearch && member.isSeller;
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

  const handleApprove = async (requestId: number) => {
    if (!onApprove) return;
    setProcessingId(requestId);
    try {
      const success = await onApprove(requestId);
      if (success) {
        toast.success('Member approved successfully');
      } else {
        toast.error('Failed to approve member');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!onReject) return;
    setProcessingId(requestId);
    try {
      const success = await onReject(requestId);
      if (success) {
        toast.success('Join request rejected');
      } else {
        toast.error('Failed to reject request');
      }
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

  const handleAddVolunteer = async (members: CommunityMember[]) => {
    try {
      if (!communityId) {
        toast.error('Community ID is missing');
        return;
      }

      const userIds = members.map(m => m.id);
      const success = await CommunityService.addVolunteersToCommunity(communityId, userIds);

      if (success) {
        // Add members to local volunteers state
        setVolunteers([...volunteers, ...members]);
        toast.success(`${members.length} member${members.length !== 1 ? 's' : ''} added as volunteer${members.length !== 1 ? 's' : ''}`);
      } else {
        toast.error('Failed to add volunteers');
      }
    } catch (error) {
      toast.error('Failed to add volunteers');
      console.error('Error adding volunteers:', error);
    }
  };

  const admins = members.filter(m => m.role === 'admin');
  const moderators = members.filter(m => m.role === 'moderator');
  const sellers = members.filter(m => m.isSeller);

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
              <p className="text-xl font-black text-slate-900">{members.length}</p>
            </div>
            {sellers.length > 0 && (
              <div className="text-center px-6 py-3 bg-teal-50 rounded-2xl border border-teal-100">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Sellers</p>
                <p className="text-xl font-black text-teal-700">{sellers.length}</p>
              </div>
            )}
            {isPrivileged && pendingRequests.length > 0 && (
              <div className="text-center px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pending</p>
                <p className="text-xl font-black text-rose-700">{pendingRequests.length}</p>
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
              <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none px-1.5 py-0 min-w-[20px] h-5">{approvedMembers.length}</Badge>
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
              {pendingRequests.length > 0 && (
                <Badge className="bg-white text-rose-500 border-none px-1.5 py-0 min-w-[20px] h-5 shadow-sm">
                  {pendingRequests.length}
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
                {volunteers.length}
              </Badge>
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-6">
          {/* Constraints & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
              {(['all', 'admin', 'moderator', 'member', 'seller'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                    roleFilter === role 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100 shadow-sm"
                  )}
                >
                  {role === 'seller' && <ShoppingBag size={12} />}
                  {role === 'all' ? 'Everyone' : role === 'seller' ? 'Sellers' : role + 's'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search community..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredMembers.map((member) => {
              const joinedDate = new Date(member.joinedAt);
              const memberSince = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card 
                  key={member.id} 
                  className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-100/30 hover:border-teal-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Top Status Bar - Color based on role */}
                  <div className={cn(
                    "h-1.5 group-hover:h-2 transition-all",
                    member.role === 'admin' ? "bg-gradient-to-r from-rose-400 to-rose-500 group-hover:from-rose-500 group-hover:to-rose-600" :
                    member.role === 'moderator' ? "bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500" :
                    "bg-gradient-to-r from-teal-400 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-500"
                  )} />
                  
                  {/* Header Section with Badge */}
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {member.isSeller && (
                          <Badge className="bg-teal-100 text-teal-700 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-sm flex items-center gap-1">
                            <ShoppingBag size={10} />
                            Seller
                          </Badge>
                        )}
                        <Badge className={cn(
                          "border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-sm",
                          member.role === 'admin' ? "bg-rose-100 text-rose-700" :
                          member.role === 'moderator' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {member.role === 'admin' ? '👑 Admin' : member.role === 'moderator' ? '⚡ Moderator' : '👤 Member'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="px-6 py-8 flex-1 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={cn(
                        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300",
                        member.role === 'admin' ? "bg-gradient-to-br from-rose-200 to-rose-200" :
                        member.role === 'moderator' ? "bg-gradient-to-br from-amber-200 to-orange-200" :
                        "bg-gradient-to-br from-teal-200 to-emerald-200"
                      )} />
                      <Avatar 
                        src={member.profilePicture}
                        alt={member.name}
                        className={cn(
                          "relative w-20 h-20 rounded-2xl border-4 border-white shadow-lg text-lg font-black",
                          member.role === 'admin' ? "bg-gradient-to-br from-rose-100 to-rose-200" :
                          member.role === 'moderator' ? "bg-gradient-to-br from-amber-100 to-orange-200" :
                          "bg-gradient-to-br from-teal-100 to-emerald-200"
                        )}
                      >
                        {member.name?.charAt(0)}
                      </Avatar>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-teal-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 font-mono mb-6">@{member.username}</p>

                    {/* Info Cards */}
                    <div className="w-full space-y-3 mb-6">
                      {/* Joined Date */}
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        member.role === 'admin' ? "bg-white border-slate-100 group-hover:border-rose-200 group-hover:bg-rose-50/30" :
                        member.role === 'moderator' ? "bg-white border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30" :
                        "bg-white border-slate-100 group-hover:border-teal-200 group-hover:bg-teal-50/30"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg text-slate-600 flex items-center justify-center",
                          member.role === 'admin' ? "bg-rose-50 text-rose-600" :
                          member.role === 'moderator' ? "bg-amber-50 text-amber-600" :
                          "bg-teal-50 text-teal-600"
                        )}>
                          <Calendar size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Joined</p>
                          <p className="text-xs font-bold text-slate-600">{joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                      {/* Member Duration */}
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        member.role === 'admin' ? "bg-white border-slate-100 group-hover:border-rose-200 group-hover:bg-rose-50/30" :
                        member.role === 'moderator' ? "bg-white border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30" :
                        "bg-white border-slate-100 group-hover:border-teal-200 group-hover:bg-teal-50/30"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg text-slate-600 flex items-center justify-center",
                          member.role === 'admin' ? "bg-rose-50 text-rose-600" :
                          member.role === 'moderator' ? "bg-amber-50 text-amber-600" :
                          "bg-teal-50 text-teal-600"
                        )}>
                          <UserCheck size={16} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Member For</p>
                          <p className="text-xs font-bold text-slate-600">{memberSince === 0 ? 'New' : memberSince === 1 ? '1 day' : `${memberSince} days`}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                    {/* Message Button */}
                    <Button 
                      onClick={() => handleDirectChat(member.id, member.name)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={14} />
                      Send Message
                    </Button>

                    {/* View Profile Button */}
                    <Button 
                      onClick={() => {
                        setSelectedUserId(member.id);
                        setIsProfilePreviewOpen(true);
                      }}
                      className={cn(
                        "w-full h-10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2",
                        member.role === 'admin' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200 hover:shadow-rose-300" :
                        member.role === 'moderator' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200 hover:shadow-amber-300" :
                        "bg-teal-600 hover:bg-teal-700 shadow-teal-200 hover:shadow-teal-300"
                      )}
                    >
                      <ExternalLink size={14} />
                      View Profile
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab !== 'members' && activeSubTab !== 'volunteers' && (
        <div className="space-y-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => {
              const requestDate = new Date(request.dateCreated);
              const daysAgo = Math.floor((new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card 
                  key={request.id} 
                  className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-amber-100/30 hover:border-amber-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Top Status Bar */}
                  <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500 transition-all" />
                  
                  {/* Header Section */}
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm">
                        Pending Approval
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">
                        {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                      </span>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="px-6 py-8 flex-1 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-200 rounded-[1.75rem] opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                      <Avatar 
                        src={request.profilePictureUrl}
                        alt={request.userFullName}
                        className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-lg text-lg font-black bg-gradient-to-br from-slate-100 to-slate-200"
                      >
                        {request.userFullName?.charAt(0) || request.userName?.charAt(0)}
                      </Avatar>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-amber-600 transition-colors">
                      {request.userFullName}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 font-mono mb-6">@{request.userName}</p>

                    {/* Info Cards */}
                    <div className="w-full space-y-3 mb-6">
                      {/* Request Date */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Calendar size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Requested</p>
                          <p className="text-xs font-bold text-slate-600">{requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                      {/* Email/Contact */}
                      {request.userEmail && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Mail size={16} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Email</p>
                            <p className="text-xs font-bold text-slate-600 truncate">{request.userEmail}</p>
                          </div>
                        </div>
                      )}

                      {/* Phone Number */}
                      {request.userPhone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                            <Phone size={16} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone</p>
                            <p className="text-xs font-bold text-slate-600 truncate">{request.userPhone}</p>
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      {request.userAddress && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <MapPin size={16} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Address</p>
                            <p className="text-xs font-bold text-slate-600 truncate">{request.userAddress}</p>
                          </div>
                        </div>
                      )}

                      {/* Demographics Row */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {request.userAge && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-black">👤</span>
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Age</p>
                              <p className="text-xs font-bold text-slate-600">{request.userAge}</p>
                            </div>
                          </div>
                        )}

                        {request.userSex && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                            <div className="w-6 h-6 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-black">⚧</span>
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Sex</p>
                              <p className="text-xs font-bold text-slate-600 capitalize">{request.userSex}</p>
                            </div>
                          </div>
                        )}

                        {request.userLocation && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                            <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-black">📍</span>
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">City</p>
                              <p className="text-xs font-bold text-slate-600 truncate">{request.userLocation}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Request Message */}
                      {request.requestMessage && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-none mb-1">Message</p>
                          <p className="text-xs text-amber-900 leading-relaxed">{request.requestMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                    {/* View Full Profile Button */}
                    <Button 
                      onClick={() => {
                        setSelectedUserId(request.userId);
                        setIsProfilePreviewOpen(true);
                      }}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      View Full Profile
                    </Button>

                    {/* Approve/Reject Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleReject(request.id)} 
                        disabled={processingId === request.id} 
                        className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-300 flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            <X size={16} strokeWidth={3} />
                            <span className="hidden sm:inline">Decline</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => handleApprove(request.id)} 
                        disabled={processingId === request.id} 
                        className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            <Check size={16} strokeWidth={3} />
                            <span className="hidden sm:inline">Approve</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {pendingRequests.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:text-slate-400 transition-colors">
                  <UserPlus size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">No Join Requests</h3>
                <p className="text-slate-500 text-sm font-medium">All pending members have been reviewed!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'volunteers' && (
        <div className="space-y-6 pb-20">
          {/* Header with Add Volunteer Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                Community Volunteers
              </h3>
              <p className="text-slate-500 font-medium mt-1">Manage community volunteers and volunteers</p>
            </div>
            <Button 
              onClick={() => setIsAddVolunteerModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 py-3 h-auto font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-200 transition-all"
            >
              <UserPlus size={18} className="mr-2" />
              Add Volunteer
            </Button>
          </div>

          {/* Volunteers Grid */}
          {volunteers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((volunteer) => {
                const joinedDate = new Date(volunteer.joinedAt);
                const memberSince = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card 
                    key={volunteer.id} 
                    className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-100/30 hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    {/* Top Status Bar - Purple for volunteers */}
                    <div className="h-1.5 bg-gradient-to-r from-purple-400 to-violet-400 group-hover:from-purple-500 group-hover:to-violet-500 transition-all" />
                    
                    {/* Header Section */}
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm flex items-center gap-1">
                          <span className="text-sm">🤝</span>
                          Volunteer
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="px-6 py-8 flex-1 flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-violet-200 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                        <Avatar 
                          src={volunteer.profilePicture}
                          alt={volunteer.name}
                          className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-lg"
                        />
                      </div>

                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-purple-600 transition-colors">
                        {volunteer.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 font-mono mb-6">@{volunteer.username}</p>

                      {/* Info Cards */}
                      <div className="w-full space-y-2">
                        {/* Joined Date */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Calendar size={16} />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Joined</p>
                            <p className="text-xs font-bold text-slate-600">{joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>

                        {/* Member For */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                            <User size={16} />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Member For</p>
                            <p className="text-xs font-bold text-slate-600">{memberSince === 0 ? 'New' : memberSince === 1 ? '1 day' : `${memberSince} days`}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                      <Button 
                        onClick={() => handleDirectChat(volunteer.id, volunteer.name)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} />
                        Message
                      </Button>

                      <Button 
                        onClick={() => {
                          setSelectedUserId(volunteer.id);
                          setIsProfilePreviewOpen(true);
                        }}
                        className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={14} />
                        View Profile
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">No Volunteers Yet</h3>
              <p className="text-slate-500 text-sm font-medium">Start by adding volunteers to your community!</p>
            </div>
          )}
        </div>
      )}

      {/* Profile Preview Modal */}
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
