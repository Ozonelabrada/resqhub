import React from 'react';
import { EventData } from '../hooks/useEventData';

interface EventOverviewProps {
  event: EventData;
}

/**
 * Event overview tab component
 * <60 lines - displays event description and key stats
 */
const EventOverview: React.FC<EventOverviewProps> = ({ event }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-3">About This Event</h3>
        <p className="text-slate-600 leading-relaxed">{event?.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
        <div className="text-center">
          <p className="text-3xl font-black text-teal-600">{event?.capacity || 'N/A'}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Capacity</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-blue-600">{event?.rsvpCount || 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">RSVPs</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-green-600">{event?.attendees?.filter(a => a.checkedIn).length || 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Checked In</p>
        </div>
      </div>
    </div>
  );
};

export default EventOverview;
