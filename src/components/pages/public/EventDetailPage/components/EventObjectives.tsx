import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button } from '@/components/ui';
import { Plus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventObjectivesProps {
  event: EventData;
  isEventCreator: boolean;
}

/**
 * Event objectives tab component
 * <70 lines - displays event objectives with completion status
 */
const EventObjectives: React.FC<EventObjectivesProps> = ({ event, isEventCreator }) => {
  const completedCount = event?.objectives?.filter(o => o.completed).length || 0;
  const totalCount = event?.objectives?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800">
          Event Objectives ({completedCount}/{totalCount})
        </h3>
        {isEventCreator && event?.status === 'in-progress' && (
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2">
            <Plus size={16} />
            Add Objective
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {event?.objectives.map((objective) => (
          <div
            key={objective.id}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              objective.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-slate-100 hover:border-slate-200'
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 font-black text-sm',
                  objective.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 text-slate-300'
                )}
              >
                {objective.completed ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    'font-bold text-sm',
                    objective.completed ? 'text-green-700 line-through' : 'text-slate-800'
                  )}
                >
                  {objective.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{objective.description}</p>
              </div>
              {isEventCreator && (
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventObjectives;
