import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  UserCheck,
  Calendar,
  MoreVertical,
  Mail,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember } from '@/types/community';

interface CommunityMembersProps {
  members: CommunityMember[];
  isAdmin?: boolean;
}

export const CommunityMembers: React.FC<CommunityMembersProps> = ({ 
  members, 
  isAdmin 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member'>('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const admins = members.filter(m => m.role === 'admin');
  const moderators = members.filter(m => m.role === 'moderator');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserCheck className="text-teal-600" size={32} />
            Community Members
          </h2>
          <p className="text-slate-500 font-medium mt-1">Meet the people who make this neighborhood safer.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl font-black text-slate-900">{members.length}</p>
          </div>
          <div className="text-center px-6 py-3 bg-teal-50 rounded-2xl border border-teal-100">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Leaders</p>
            <p className="text-xl font-black text-teal-700">{admins.length + moderators.length}</p>
          </div>
        </div>
      </div>

      {/* Constraints & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {(['all', 'admin', 'moderator', 'member'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                roleFilter === role 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100 shadow-sm"
              )}
            >
              {role === 'all' ? 'All Members' : role + 's'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Find a neighbor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="group p-6 rounded-[2.5rem] bg-white border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-teal-50 overflow-hidden relative">
            {/* Role corner badge */}
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
                <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-md text-2xl font-black bg-gradient-to-br from-slate-100 to-slate-200">
                  {member.name.charAt(0)}
                </Avatar>
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-teal-500 border-4 border-white rounded-full"></div>
              </div>

              <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                {member.name}
              </h4>
              <p className="text-xs font-bold text-slate-400 mb-6 font-mono">@{member.username}</p>

              <div className="w-full space-y-4">
                <div className="flex items-center justify-center gap-6 py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                    <div className="flex items-center gap-1 justify-center text-slate-600 font-bold text-xs">
                      <Calendar size={12} className="text-teal-600" />
                      {new Date(member.joinedAt).getFullYear()}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Role</p>
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      member.role === 'admin' ? "text-rose-600" : 
                      member.role === 'moderator' ? "text-amber-600" : "text-teal-600"
                    )}>
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl border-slate-100 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest h-10 gap-2">
                    <Mail size={14} /> Message
                  </Button>
                  <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest h-10 gap-2">
                    <ExternalLink size={14} /> Profile
                  </Button>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && member.role !== 'admin' && (
                <div className="mt-4 pt-4 border-t border-slate-50 w-full">
                  <Button variant="ghost" className="w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black text-[9px] uppercase tracking-[0.2em] rounded-xl h-8">
                    Manage Access
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <User size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No neighbors found</h3>
            <p className="text-slate-500 font-medium tracking-tight">Try searching with a different name or username.</p>
          </div>
        )}
      </div>
    </div>
  );
};
