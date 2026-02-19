import React from 'react';
import { Card } from '@/components/ui';
import { EventData } from '../hooks/useEventData';

interface EventSponsorsCardProps {
  event: EventData;
}

/**
 * Event sponsors card component
 * <50 lines - displays event sponsors
 */
const EventSponsorsCard: React.FC<EventSponsorsCardProps> = ({ event }) => {
  if (!event?.sponsors || event.sponsors.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 md:p-6 rounded-[2.5rem] bg-white border-slate-100">
      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Sponsors</h3>
      <div className="space-y-3">
        {event.sponsors.map((sponsor) => (
          <div key={sponsor.id} className="flex items-center gap-3 p-2 md:p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-800 truncate">{sponsor.name}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EventSponsorsCard;
