import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
} from '../../ui';
import { Users, MapPin, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Community } from '@/types';

interface CommunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community | null;
}

export const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  isOpen,
  onClose,
  community,
}) => {
  if (!community) return null;

  const isPending = community.status === 'pending' || community.status === 'Pending';
  const isRejected = community.status === 'rejected' || community.status === 'Rejected';
  const isDisabled = community.status === 'disabled' || community.status === 'Disabled';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-[2.5rem] p-0">
        {/* Banner */}
        <div className="h-40 relative overflow-hidden">
          {community.banner || community.imageUrl ? (
            <img
              src={community.banner || community.imageUrl || undefined}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600" />
          )}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge
              className={cn(
                'font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none shadow-md',
                isPending
                  ? 'bg-amber-500 text-white'
                  : isRejected
                    ? 'bg-red-500 text-white'
                    : isDisabled
                      ? 'bg-slate-500 text-white'
                      : 'bg-green-500 text-white'
              )}
            >
              {community.status}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{community.name}</h2>
                {community.tagline && (
                  <p className="text-sm text-slate-600 mt-1">{community.tagline}</p>
                )}
              </div>
              {community.logo && (
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                />
              )}
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">About</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {community.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Members Count */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-teal-600" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Members
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {community.membersCount || community.memberCount || 0}
              </p>
            </div>

            {/* Location */}
            {community.location && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Location
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{community.location}</p>
              </div>
            )}

            {/* Founded/Created Date */}
            {(community.foundedDate || community.dateCreated) && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Created
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {community.foundedDate || community.dateCreated
                    ? new Date(
                        (community.foundedDate || community.dateCreated) as string | number
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            )}
          </div>

          {/* Rules Section */}
          {community.rules && community.rules.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Community Rules</h3>
              <ul className="space-y-2">
                {community.rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-slate-700 flex gap-2 items-start"
                  >
                    <span className="text-teal-600 font-bold mt-0.5">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status Message for Pending */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Note:</span> This community is pending
                approval. Once approved, it will be visible to all members.
              </p>
            </div>
          )}

          {/* Status Message for Rejected */}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                <span className="font-semibold">Note:</span> This community was rejected.
                Please review and resubmit if you'd like to try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
