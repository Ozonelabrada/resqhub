import React from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JoinRequest, CommunityMember } from '@/types/community';

interface JoinRequestsGridProps {
  requests: (JoinRequest | any)[];
  processingId: number | null;
  onApprove: (requestId: number, userId: string) => void;
  onReject: (requestId: number, userId: string) => void;
  onViewProfile: (userId: string) => void;
}

/**
 * Join requests grid component
 * <150 lines - handles pending membership requests
 */
const JoinRequestsGrid: React.FC<JoinRequestsGridProps> = ({
  requests,
  processingId,
  onApprove,
  onReject,
  onViewProfile,
}) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => {
          const requestDate = new Date(request.dateCreated);
          const daysAgo = Math.floor(
            (new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card
              key={request.id}
              className="group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-amber-100/30 hover:border-amber-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500 transition-all" />

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
                <p className="text-xs font-bold text-slate-400 font-mono mb-6">
                  @{request.userName}
                </p>

                <div className="w-full space-y-3 mb-6">
                  {request.userEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail size={16} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Email
                        </p>
                        <p className="text-xs font-bold text-slate-600 truncate">
                          {request.userEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {request.userPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                        <Phone size={16} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Phone
                        </p>
                        <p className="text-xs font-bold text-slate-600 truncate">
                          {request.userPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  {request.userAddress && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Address
                        </p>
                        <p className="text-xs font-bold text-slate-600 truncate">
                          {request.userAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 border-t border-slate-100 space-y-3">
                <Button
                  onClick={() => onViewProfile(request.userId)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  View Full Profile
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => onReject(request.id, request.userId)}
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
                    onClick={() => onApprove(request.id, request.userId)}
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
      </div>
    </div>
  );
};

export default JoinRequestsGrid;
