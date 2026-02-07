import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Download, ArrowRight } from 'lucide-react';

interface EventResourcesProps {
  event: EventData;
}

/**
 * Event resources tab component
 * <60 lines - displays downloadable materials and documents
 */
const EventResources: React.FC<EventResourcesProps> = ({ event }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
        <Download size={20} />
        Resources & Materials
      </h3>
      {event?.resources && event.resources.length > 0 ? (
        <div className="space-y-3">
          {event.resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Download size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{resource.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{resource.type}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-50 rounded-xl">
          <Download size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 font-semibold">No resources available yet</p>
        </div>
      )}
    </div>
  );
};

export default EventResources;
