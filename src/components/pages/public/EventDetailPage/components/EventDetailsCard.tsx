import React from 'react';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { EventData } from '../hooks/useEventData';

interface EventDetailsCardProps {
  event: EventData;
}

/**
 * Event details card component (right sidebar)
 * <80 lines - displays date, time, location, contact info
 */
const EventDetailsCard: React.FC<EventDetailsCardProps> = ({ event }) => {
  return (
    <Card className="p-6 rounded-[2.5rem] bg-white border-slate-100">
      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Event Details</h3>
      <div className="space-y-4">
        {/* Start & End Date Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Start Date & Time */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Calendar size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Starts</p>
              <p className="text-xs font-bold text-slate-800">
                {event &&
                  new Date(`${event.startDate}T${event.startTime}`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
              </p>
              <p className="text-xs text-slate-600">
                {event &&
                  new Date(`${event.startDate}T${event.startTime}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </p>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Clock size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ends</p>
              <p className="text-xs font-bold text-slate-800">
                {event &&
                  new Date(`${event.endDate}T${event.endTime}`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
              </p>
              <p className="text-xs text-slate-600">
                {event &&
                  new Date(`${event.endDate}T${event.endTime}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
            <MapPin size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Location</p>
            <p className="text-sm font-bold text-slate-800">{event?.location}</p>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Phone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Contact</p>
            <p className="text-sm font-bold text-slate-800 break-words">{event?.contactInfo}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventDetailsCard;
