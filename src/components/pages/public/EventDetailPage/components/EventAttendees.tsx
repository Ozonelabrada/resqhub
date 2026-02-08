import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button, Badge, Avatar } from '@/components/ui';
import { CheckCircle, QrCode } from 'lucide-react';

interface EventAttendeesProps {
  event: EventData;
  isEventCreator: boolean;
  onCheckInClick: () => void;
}

/**
 * Event attendees tab component
 * <60 lines - displays list of attendees with check-in status
 */
const EventAttendees: React.FC<EventAttendeesProps> = ({
  event,
  isEventCreator,
  onCheckInClick,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800">
          Attendees ({event?.attendees?.length || 0})
        </h3>
        {event?.status === 'in-progress' && isEventCreator && (
          <Button
            onClick={onCheckInClick}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
          >
            <QrCode size={16} />
            Check In
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {event?.attendees.map((attendee) => (
          <div
            key={attendee.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 font-bold text-sm">
                {attendee.fullName.charAt(0)}
              </Avatar>
              <div>
                <p className="font-bold text-sm text-slate-800">{attendee.fullName}</p>
                <p className="text-xs text-slate-500 capitalize">{attendee.role || 'Participant'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {attendee.checkedIn ? (
                <Badge className="bg-green-100 text-green-700 border-none rounded-lg flex items-center gap-1">
                  <CheckCircle size={14} />
                  <span className="text-xs font-bold">Checked In</span>
                </Badge>
              ) : (
                <Badge className="bg-slate-200 text-slate-600 border-none rounded-lg">
                  <span className="text-xs font-bold">Pending</span>
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventAttendees;
