import React from 'react';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { Eye, Edit, Trash2, AlertCircle, UserCheck, CheckCircle, QrCode } from 'lucide-react';
import { EventData } from '../hooks/useEventData';

interface EventCreatorCardProps {
  event: EventData;
  isEventCreator: boolean;
  isCommunityAdmin?: boolean;
  isCheckedIn: boolean;
  isRsvpd?: boolean;
  isFavorite: boolean;
  onStartEvent: () => void;
  onCheckIn: () => void;
  onRSVP: () => void;
  onFavorite: () => void;
  onQRCode?: () => void;
}

/**
 * Event creator info and action card component
 * <100 lines - displays organizer info and action buttons
 */
const EventCreatorCard: React.FC<EventCreatorCardProps> = ({
  event,
  isEventCreator,
  isCommunityAdmin,
  isCheckedIn,
  isRsvpd,
  isFavorite,
  onStartEvent,
  onCheckIn,
  onRSVP,
  onFavorite,
  onQRCode,
}) => {
  return (
    <Card className="p-4 md:p-6 rounded-[2.5rem] bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100 md:sticky md:top-24 space-y-4">
      {/* Event Creator Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-teal-100">
        <Avatar className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold text-sm">
          {event?.user.fullName.charAt(0)}
        </Avatar>
        <div className="flex-1">
          <p className="text-xs font-black text-teal-600 uppercase">Organizer</p>
          <p className="text-sm font-bold text-slate-800">{event?.user.fullName}</p>
        </div>
      </div>

      {/* Category & Privacy */}
      <div className="space-y-2">
        <Badge className="w-full justify-center rounded-xl bg-teal-100 text-teal-700 border-none py-2 font-bold">
          {event?.categoryName}
        </Badge>
        {event?.privacy === 'internal' && (
          <Badge className="w-full justify-center rounded-xl bg-rose-100 text-rose-700 border-none py-2 font-bold flex items-center gap-1">
            <Eye size={12} />
            Internal
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      {isEventCreator || isCommunityAdmin ? (
        <div className="space-y-2 md:space-y-3 pt-4 border-t border-teal-100">
          {new Date(`${event.startDate}T${event.startTime}`) > new Date() && event.status === 'upcoming' && (
            <Button
              onClick={onStartEvent}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold md:font-black rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <AlertCircle size={16} className="md:w-[18px] md:h-[18px]" />
              Start Event
            </Button>
          )}
          {isEventCreator && (
            <>
              <Button variant="outline" className="w-full rounded-xl py-2 md:py-3 font-bold md:font-black flex items-center justify-center gap-2 text-sm md:text-base">
                <Edit size={16} className="md:w-[16px]" />
                Edit Event
              </Button>
              <Button variant="outline" className="w-full rounded-xl py-2 md:py-3 font-bold md:font-black flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 text-sm md:text-base">
                <Trash2 size={16} className="md:w-[16px]" />
                Delete Event
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3 pt-4 border-t border-teal-100">
          {!isCheckedIn && event?.status === 'in-progress' && (
            <Button
              onClick={onQRCode}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold md:font-black rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <QrCode size={16} className="md:w-[18px] md:h-[18px]" />
              Generate Check-In QR
            </Button>
          )}
          {isCheckedIn && (
            <div className="p-2 md:p-3 bg-green-100 rounded-xl border border-green-200">
              <p className="text-xs font-bold md:font-black text-green-700 flex items-center gap-2">
                <CheckCircle size={14} />
                Checked In
              </p>
            </div>
          )}
          <Button
            onClick={onRSVP}
            className={`w-full font-bold md:font-black rounded-xl py-2 md:py-3 text-sm md:text-base ${
              isRsvpd
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isRsvpd ? 'Remove RSVP' : 'RSVP'}
          </Button>
        </div>
      )}

      {/* QR Code Section - Admin Only */}
      {event?.status === 'in-progress' && event?.qrCode && onQRCode && isCommunityAdmin && (
        <div className="pt-4 border-t border-teal-100 space-y-2 md:space-y-3">
          <Button
            onClick={onQRCode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold md:font-black rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <QrCode size={16} className="md:w-[16px] md:h-[16px]" />
            Scan Member QR
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EventCreatorCard;
