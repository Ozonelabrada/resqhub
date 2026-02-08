import React from 'react';
import { Card, Badge } from '@/components/ui';
import { EventData } from '../hooks/useEventData';

interface EventCountdownCardProps {
  event: EventData;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
}

/**
 * Event countdown timer card component
 * <50 lines - displays time remaining until event starts
 */
const EventCountdownCard: React.FC<EventCountdownCardProps> = ({ event, timeRemaining }) => {
  if (!timeRemaining || event?.status !== 'upcoming') {
    return null;
  }

  return (
    <Card className="p-6 rounded-[2.5rem] bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
      <h3 className="text-xs font-black text-orange-600 uppercase mb-4">Event Starts In</h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <p className="text-2xl font-black text-orange-600">{timeRemaining.days}</p>
          <p className="text-[10px] font-bold text-orange-500 uppercase">Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-orange-600">{timeRemaining.hours}</p>
          <p className="text-[10px] font-bold text-orange-500 uppercase">Hours</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-orange-600">{timeRemaining.minutes}</p>
          <p className="text-[10px] font-bold text-orange-500 uppercase">Mins</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-orange-600">{timeRemaining.seconds}</p>
          <p className="text-[10px] font-bold text-orange-500 uppercase">Secs</p>
        </div>
      </div>
    </Card>
  );
};

export default EventCountdownCard;
