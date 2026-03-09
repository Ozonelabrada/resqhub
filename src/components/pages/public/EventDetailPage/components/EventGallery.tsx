import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button } from '@/components/ui';
import { Image as ImageIcon, Plus, Upload } from 'lucide-react';

interface EventGalleryProps {
  event: EventData;
  isAdmin?: boolean;
  isEventCreator?: boolean;
}

/**
 * Event gallery tab component
 * <50 lines - displays event photos in grid
 */
const EventGallery: React.FC<EventGalleryProps> = ({ event, isAdmin = false, isEventCreator = false }) => {
  const canManageGallery = isAdmin || isEventCreator;

  const handleUploadPhotos = () => {
    // TODO: Open photo upload modal
    console.log('Upload photos clicked');
  };

  const handleAddFromURL = () => {
    // TODO: Open add photo from URL modal
    console.log('Add from URL clicked');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <ImageIcon size={20} />
          Event Gallery
        </h3>
        {canManageGallery && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddFromURL}
              variant="outline"
              className="text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add URL
            </Button>
            <Button
              onClick={handleUploadPhotos}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Photos
            </Button>
          </div>
        )}
      </div>
      {event?.gallery && event.gallery.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="text-xs font-bold text-slate-500 uppercase">Photos: {event?.stats?.gallery?.photosCount ?? event.gallery.length}</div>
          </div>

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
        </>
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
