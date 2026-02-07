import React from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import {
  Calendar,
  User,
  ExternalLink,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember } from '@/types/community';

interface VolunteersGridProps {
  volunteers: CommunityMember[];
  onDirectChat: (userId: string, userName: string) => void;
  onViewProfile: (userId: string) => void;
  onAddVolunteer: () => void;
  isEmpty: boolean;
}

/**
 * Volunteers grid component
 * <140 lines - handles volunteer display and management
 */
const VolunteersGrid: React.FC<VolunteersGridProps> = ({
  volunteers,
  onDirectChat,
  onViewProfile,
  onAddVolunteer,
  isEmpty,
}) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            Community Volunteers
          </h3>
          <p className="text-slate-500 font-medium mt-1">
            Manage community volunteers and volunteers
          </p>
        </div>
        <Button
          onClick={onAddVolunteer}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 py-3 h-auto font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-200 transition-all"
        >
          <UserPlus size={18} className="mr-2" />
          Add Volunteer
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">
            No Volunteers Yet
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Start by adding volunteers to your community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map((volunteer) => {
            const joinedDate = new Date(volunteer.joinedAt);
            const memberSince = Math.floor(
              (new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Card
                key={volunteer.id}
                className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-100/30 hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="h-1.5 bg-gradient-to-r from-purple-400 to-violet-400 group-hover:from-purple-500 group-hover:to-violet-500 transition-all" />

                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                  <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm flex items-center gap-1 w-fit">
                    <span className="text-sm">🤝</span>
                    Volunteer
                  </Badge>
                </div>

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
                  <p className="text-xs font-bold text-slate-400 font-mono mb-6">
                    @{volunteer.username}
                  </p>

                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Joined
                        </p>
                        <p className="text-xs font-bold text-slate-600">
                          {joinedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Member For
                        </p>
                        <p className="text-xs font-bold text-slate-600">
                          {memberSince === 0
                            ? 'New'
                            : memberSince === 1
                              ? '1 day'
                              : `${memberSince} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                  <Button
                    onClick={() => onDirectChat(volunteer.id, volunteer.name)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} />
                    Message
                  </Button>

                  <Button
                    onClick={() => onViewProfile(volunteer.id)}
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
      )}
    </div>
  );
};

export default VolunteersGrid;
