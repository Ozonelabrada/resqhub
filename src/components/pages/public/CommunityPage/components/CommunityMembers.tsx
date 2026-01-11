import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  UserCheck,
  Calendar,
  Mail,
  ExternalLink,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember, JoinRequest } from '@/types/community';
import { MessagesService } from '@/services/messagesService';
import { toast } from 'react-hot-toast';

interface CommunityMembersProps {
  members: CommunityMember[];
  joinRequests?: JoinRequest[];
  isAdmin?: boolean;
  isModerator?: boolean;
  onApprove?: (requestId: number) => Promise<boolean>;
  onReject?: (requestId: number) => Promise<boolean>;
  onRefresh?: () => void;
}

export const CommunityMembers: React.FC<CommunityMembersProps> = ({ 
  members, 
  joinRequests = [],
  isAdmin,
  isModerator,
  onApprove,
  onReject,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'requests'>('members');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const isPrivileged = isAdmin || isModerator;

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingRequests = joinRequests.filter(req => req.status === 'Pending');

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

  const admins = members.filter(m => m.role === 'admin');
  const moderators = members.filter(m => m.role === 'moderator');

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
              <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none px-1.5 py-0 min-w-[20px] h-5">{members.length}</Badge>
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
          </div>
        )}
      </div>

      {activeSubTab === 'members' ? (
        <div className="space-y-6">
          {/* Constraints & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
              {(['all', 'admin', 'moderator', 'member'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                    roleFilter === role 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100 shadow-sm"
                  )}
                >
                  {role === 'all' ? 'Everyone' : role + 's'}
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
            {filteredMembers.map((member) => (
              <Card key={member.id} className="group p-6 rounded-[2.5rem] bg-white border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative border border-transparent hover:border-teal-50">
                <div className={cn(
                   "absolute top-6 right-6 p-1.5 rounded-lg",
                   member.role === 'admin' ? "bg-rose-50 text-rose-600" : 
                   member.role === 'moderator' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                )}>
                   {member.role === 'admin' ? <ShieldAlert size={16} /> : 
                    member.role === 'moderator' ? <ShieldCheck size={16} /> : <User size={16} />}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-md text-2xl font-black bg-slate-100">
                      {member.name?.charAt(0)}
                    </Avatar>
                  </div>

                  <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{member.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-6 font-mono italic">@{member.username}</p>

                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-center gap-6 py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                        <p className="text-xs font-black text-slate-600">{new Date(member.joinedAt).getFullYear()}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rank</p>
                        <p className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          member.role === 'admin' ? "text-rose-500" : 
                          member.role === 'moderator' ? "text-amber-500" : "text-teal-500"
                        )}>{member.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handleDirectChat(member.id, member.name)} variant="outline" className="rounded-xl border-slate-100 hover:bg-slate-50 font-black text-[10px] uppercase h-10 gap-2">
                        <Mail size={14} /> Message
                      </Button>
                      <Button onClick={() => navigate(`/profile/${member.username}`)} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase h-10 gap-2">
                        <ExternalLink size={14} /> Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-5 rounded-[2.2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-sm text-lg font-black bg-slate-100">
                      {request.userFullName?.charAt(0) || request.userName?.charAt(0)}
                    </Avatar>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight">{request.userFullName}</h4>
                      <p className="text-xs font-bold text-slate-400 font-mono italic">@{request.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleDirectChat(request.userId, request.userFullName)} variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-teal-600 hover:bg-teal-50">
                      <MessageCircle size={20} />
                    </Button>
                    <div className="w-px h-8 bg-slate-100 mx-1" />
                    <Button onClick={() => handleReject(request.id)} disabled={processingId === request.id} variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50">
                      {processingId === request.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                    </Button>
                    <Button onClick={() => handleApprove(request.id)} disabled={processingId === request.id} className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                      {processingId === request.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {pendingRequests.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <UserPlus size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight uppercase">Dashboard Clear</h3>
                <p className="text-slate-500 text-sm font-medium">No pending neighbors waiting to be verified.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
