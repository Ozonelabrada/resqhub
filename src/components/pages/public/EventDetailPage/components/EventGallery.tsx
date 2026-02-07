import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Image as ImageIcon } from 'lucide-react';

interface EventGalleryProps {
  event: EventData;
}

/**
 * Event gallery tab component
 * <50 lines - displays event photos in grid
 */
const EventGallery: React.FC<EventGalleryProps> = ({ event }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
        <ImageIcon size={20} />
        Event Gallery
      </h3>
      {event?.gallery && event.gallery.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {event.gallery.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden bg-slate-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-50 rounded-xl">
          <ImageIcon size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 font-semibold">No photos yet</p>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
