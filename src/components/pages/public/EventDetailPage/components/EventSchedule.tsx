import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Clock } from 'lucide-react';

interface EventScheduleProps {
  event: EventData;
}

/**
 * Event schedule tab component
 * <60 lines - displays timeline of event activities
 */
const EventSchedule: React.FC<EventScheduleProps> = ({ event }) => {
  const sessionsCount = event?.stats?.schedule?.sessionsCount ?? event?.schedule?.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 mb-6">Event Schedule</h3>
        <div className="text-xs font-bold text-slate-500 uppercase mt-1">Sessions: {sessionsCount}</div>
      </div>

      <div className="space-y-3">
        {event?.schedule?.map((item, index) => (
          <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 font-black text-sm flex items-center justify-center">
                {index + 1}
              </div>
              {index < (event?.schedule?.length || 0) - 1 && (
                <div className="w-1 h-12 bg-gradient-to-b from-teal-200 to-slate-100 mt-2" />
              )}
            </div>
            <div className="flex-1 pt-2">
              <p className="text-xs font-black text-teal-600 uppercase mb-1 flex items-center gap-1">
                <Clock size={12} />
                {item.time}
              </p>
              <p className="font-bold text-slate-800 mb-1">{item.title}</p>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSchedule;
