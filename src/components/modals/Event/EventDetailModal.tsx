import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock,
  X,
  Building,
  ExternalLink
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  Button,
  ScrollArea,
  ShadcnBadge as Badge
} from '@/components/ui';
import { formatDate } from '@/utils';
import type { TodaysUpdate } from '@/hooks/useTodaysUpdates';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TodaysUpdate | null;
  onNavigateToCommunity?: (communityId?: number) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onNavigateToCommunity
}) => {
  if (!event) return null;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const typeColors = {
    'event': { badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600' },
    'announcement': { badge: 'bg-purple-100 text-purple-700', icon: 'text-purple-600' },
    'news': { badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' }
  };

  const colors = typeColors[event.type] || typeColors.event;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] bg-white border-none shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col outline-none">
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-slate-200">
          <div className="flex-1">
            <Badge className={`${colors.badge} mb-2 capitalize text-xs font-bold`}>
              {event.type}
            </Badge>
            <h2 className="text-base md:text-lg font-black text-slate-900 break-words pr-2">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 inline-block"
            type="button"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="space-y-4 pb-2">
            {/* Community Info */}
            {event.communityName && (
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Building size={16} className="text-slate-600 flex-shrink-0 hidden md:block" />
                <Building size={14} className="text-slate-600 flex-shrink-0 md:hidden" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Community</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{event.communityName}</p>
                </div>
              </div>
            )}

            {/* Date & Time */}
            {event.startDate && (
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5 hidden md:block" />
                <Calendar size={14} className="text-slate-600 flex-shrink-0 mt-0.5 md:hidden" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Date & Time</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {formatDateDisplay(event.startDate)}
                  </p>
                  <div className="flex gap-1 md:gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                      <Clock size={12} />
                      <span className="hidden sm:inline">Start:</span> {formatTime(event.startDate)}
                    </span>
                    {event.endDate && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                        <Clock size={12} />
                        <span className="hidden sm:inline">End:</span> {formatTime(event.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
                <MapPin size={16} className="text-slate-600 flex-shrink-0 mt-0.5 hidden md:block" />
                <MapPin size={14} className="text-slate-600 flex-shrink-0 mt-0.5 md:hidden" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                  <p className="text-sm font-bold text-slate-900 break-words mt-1">{event.location}</p>
                </div>
              </div>
            )}

            {/* Category */}
            {event.category && (
              <div className="p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Category</p>
                <Badge variant="outline" className="capitalize text-xs md:text-sm">
                  {event.category}
                </Badge>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="p-2 md:p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Details</p>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 px-4 md:px-6 py-3 flex gap-2 bg-slate-50 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 text-xs md:text-sm"
          >
            Close
          </Button>
          {event.communityId && onNavigateToCommunity && (
            <Button
              size="sm"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm"
              onClick={() => {
                onNavigateToCommunity(event.communityId);
                onClose();
              }}
            >
              <ExternalLink size={14} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">View</span> Community
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
