import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button } from '@/components/ui';
import { Download, ArrowRight, Plus, Upload } from 'lucide-react';

interface EventResourcesProps {
  event: EventData;
  isAdmin?: boolean;
  isEventCreator?: boolean;
}

/**
 * Event resources tab component
 * <60 lines - displays downloadable materials and documents
 */
const EventResources: React.FC<EventResourcesProps> = ({ event, isAdmin = false, isEventCreator = false }) => {
  const canManageResources = isAdmin || isEventCreator;

  const handleAddResource = () => {
    // TODO: Open add resource modal
    console.log('Add resource clicked');
  };

  const handleUploadResource = () => {
    // TODO: Open file upload modal
    console.log('Upload resource clicked');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Download size={20} />
          Resources & Materials
        </h3>
        <div className="flex items-center gap-2">
          {canManageResources && (
            <>
              <Button
                onClick={handleUploadResource}
                variant="outline"
                className="text-sm flex items-center gap-2"
              >
                <Upload size={16} />
                Upload
              </Button>
              <Button
                onClick={handleAddResource}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Resource
              </Button>
            </>
          )}
          <div className="text-xs font-bold text-slate-500 uppercase">{event?.stats?.resources?.total ?? event?.resources?.length ?? 0} items</div>
        </div>
      </div>

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
