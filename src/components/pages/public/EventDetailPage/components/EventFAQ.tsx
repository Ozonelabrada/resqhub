import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Button } from '@/components/ui';
import { HelpCircle, Zap, Plus } from 'lucide-react';

interface EventFAQProps {
  event: EventData;
  isAdmin?: boolean;
  isEventCreator?: boolean;
}

/**
 * Event FAQ tab component
 * <50 lines - displays frequently asked questions
 */
const EventFAQ: React.FC<EventFAQProps> = ({ event, isAdmin = false, isEventCreator = false }) => {
  const canManageFAQ = isAdmin || isEventCreator;

  const handleAddFAQ = () => {
    // TODO: Open add FAQ modal
    console.log('Add FAQ clicked');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <HelpCircle size={20} />
          Frequently Asked Questions
        </h3>
        <div className="flex items-center gap-2">
          {canManageFAQ && (
            <Button
              onClick={handleAddFAQ}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add FAQ
            </Button>
          )}
          <div className="text-xs font-bold text-slate-500 uppercase">{event?.stats?.faq?.total ?? event?.faqs?.length ?? 0} Qs</div>
        </div>
      </div>

      <div className="space-y-3">
        {event?.faqs?.map((faq) => (
          <details
            key={faq.id}
            className="group p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-200 cursor-pointer transition-all"
          >
            <summary className="flex items-center justify-between font-bold text-slate-800">
              {faq.question}
              <Zap size={18} className="text-teal-600 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default EventFAQ;
