import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button } from '@/components/ui';
import { Clock, Plus } from 'lucide-react';
import { formatSimpleMarkdown } from '@/utils/validation';

interface EventScheduleProps {
  event: EventData;
  isAdmin?: boolean;
  isEventCreator?: boolean;
}

/**
 * Event schedule tab component
 * <60 lines - displays timeline of event activities
 */
const EventSchedule: React.FC<EventScheduleProps> = ({ event, isAdmin = false, isEventCreator = false }) => {
  const sessionsCount = event?.stats?.schedule?.sessionsCount ?? event?.schedule?.length ?? 0;
  const canManageSchedule = isAdmin || isEventCreator;

  const handleAddSession = () => {
    // TODO: Open add session modal
    console.log('Add session clicked');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 mb-6">Event Schedule</h3>
        <div className="flex items-center gap-2">
          {canManageSchedule && (
            <Button
              onClick={handleAddSession}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Session
            </Button>
          )}
          <div className="text-xs font-bold text-slate-500 uppercase">Sessions: {sessionsCount}</div>
        </div>
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
              <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(item.description) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSchedule;
