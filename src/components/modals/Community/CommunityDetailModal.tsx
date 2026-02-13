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
  onManageMembers?: () => void;
  onViewJoinRequests?: () => void;
  onViewReports?: () => void;
  onModeration?: () => void;
}

export const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  isOpen,
  onClose,
  community,
  onManageMembers,
  onViewJoinRequests,
  onViewReports,
  onModeration,
}) => {
  if (!community) return null;

  const isPending = community.status === 'pending' || community.status === 'Pending';
  const isDenied = community.status === 'denied' || community.status === 'Denied';
  const isDisabled = community.status === 'disabled' || community.status === 'Disabled';

  // Determine if user has admin access
  const hasAdminAccess = community.communityUserRoles?.some(
    (role) => role.toLowerCase() === 'admin' || role.toLowerCase() === 'moderator'
  ) || community.isAdmin || community.isModerator;

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
                  : isDenied
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

          {/* About Section */}
          {community.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span> About
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {community.description}
              </p>
            </div>
          )}

          {/* Resources Section */}
          {community.resources && community.resources.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>📚</span> Resources
              </h3>
              <div className="space-y-2">
                {community.resources.map((resource, idx) => (
                  <div
                    key={resource.id || idx}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-lg mt-0.5">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{resource.title}</p>
                      {resource.description && (
                        <p className="text-xs text-slate-600 mt-1">{resource.description}</p>
                      )}
                      {resource.type && (
                        <span className="inline-block mt-2 text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                      )}
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-0.5"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
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

          {/* Status Message for Denied */}
          {isDenied && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                <span className="font-semibold">Note:</span> This community was denied.
                Please review and resubmit if you'd like to try again.
              </p>
            </div>
          )}

          {/* Community Admin Section */}
          {hasAdminAccess && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">👥</span> Community Admin Controls
              </h3>
              <p className="text-xs text-slate-600 mb-4">Manage this community's members, content, and moderation.</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onManageMembers}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm font-medium text-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!onManageMembers}
                >
                  Manage Members
                </button>
                <button
                  onClick={onViewJoinRequests}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!onViewJoinRequests}
                >
                  View Join Requests
                </button>
                <button
                  onClick={onViewReports}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!onViewReports}
                >
                  Community Reports
                </button>
                <button
                  onClick={onModeration}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!onModeration}
                >
                  Moderation
                </button>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-medium">Your Role:</span>
                  <div className="flex gap-1 flex-wrap">
                    {community.communityUserRoles?.map((role) => (
                      <Badge
                        key={role}
                        className={cn(
                          'text-xs px-2 py-1',
                          role.toLowerCase() === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-orange-100 text-orange-700'
                        )}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
