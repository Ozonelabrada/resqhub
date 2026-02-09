import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Search, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  User,
  ShoppingBag,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember } from '@/types/community';

interface MembersGridProps {
  members: CommunityMember[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: 'all' | 'admin' | 'moderator' | 'member' | 'seller';
  onRoleFilterChange: (role: 'all' | 'admin' | 'moderator' | 'member' | 'seller') => void;
  onDirectChat: (userId: string, userName: string) => void;
  onViewProfile: (userId: string) => void;
}

/**
 * Members grid component - handles rendering approved members
 * <150 lines - focuses on rendering only
 */
const MembersGrid: React.FC<MembersGridProps> = ({
  members,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onDirectChat,
  onViewProfile,
}) => {
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || roleFilter === 'seller' 
      ? (roleFilter === 'seller' ? member.isSeller : true)
      : member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {(['all', 'admin', 'moderator', 'member'] as const).map(role => (
            <button
              key={role}
              onClick={() => onRoleFilterChange(role)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredMembers.map((member) => {
          const joinedDate = new Date(member.joinedAt);
          const memberSince = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card 
              key={member.id} 
              className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-100/30 hover:border-teal-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* Top Status Bar */}
              <div className={cn(
                "h-1.5 group-hover:h-2 transition-all",
                member.role === 'admin' ? "bg-gradient-to-r from-rose-400 to-rose-500 group-hover:from-rose-500 group-hover:to-rose-600" :
                member.role === 'moderator' ? "bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500" :
                "bg-gradient-to-r from-teal-400 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-500"
              )} />
              
              {/* Header */}
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

              {/* Profile */}
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
                      <User size={16} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Member For</p>
                      <p className="text-xs font-bold text-slate-600">{memberSince === 0 ? 'New' : memberSince === 1 ? '1 day' : `${memberSince} days`}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                <Button 
                  onClick={() => onDirectChat(member.id, member.name)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} />
                  Send Message
                </Button>

                <Button 
                  onClick={() => onViewProfile(member.id)}
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
  );
};

export default MembersGrid;
