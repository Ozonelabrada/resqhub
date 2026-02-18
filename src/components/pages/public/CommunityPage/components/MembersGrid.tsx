import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Search, 
  MessageCircle,
  ExternalLink,
  ShoppingBag
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
 * Members table component - simple table layout for displaying members
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

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moderator':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'moderator':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

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
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Member</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-slate-500 font-semibold">No members found</p>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const joinedDate = new Date(member.joinedAt);
                
                return (
                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {/* Member Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white",
                          member.role === 'admin' ? "bg-gradient-to-br from-red-400 to-red-500" :
                          member.role === 'moderator' ? "bg-gradient-to-br from-orange-400 to-orange-500" :
                          "bg-gradient-to-br from-teal-400 to-emerald-500"
                        )}>
                          <Avatar 
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-12 h-12 rounded-xl"
                          >
                            {member.name?.charAt(0) || 'U'}
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{member.name}</p>
                          {member.isSeller && (
                            <div className="flex items-center gap-1 mt-1">
                              <ShoppingBag size={12} className="text-teal-600" />
                              <span className="text-[10px] font-bold text-teal-600">Seller</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">@{member.username}</p>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <Badge className={cn(
                        "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5",
                        getRoleBadgeStyle(member.role)
                      )}>
                        {member.role === 'admin' ? '👑 Admin' : member.role === 'moderator' ? '⚡ Moderator' : '👤 Member'}
                      </Badge>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">
                        {joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onDirectChat(member.id, member.name)}
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-teal-600 transition-all"
                          title="Send message"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => onViewProfile(member.id)}
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-teal-600 transition-all"
                          title="View profile"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-sm font-bold text-slate-500">
          Showing {filteredMembers.length} of {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default MembersGrid;
