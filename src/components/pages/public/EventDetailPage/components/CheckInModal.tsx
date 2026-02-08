import React from 'react';
import { UserCheck } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { EventData } from '../hooks/useEventData';

interface CheckInModalProps {
  event: EventData;
  onConfirm: () => void;
  onClose: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ event, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full p-8 rounded-[2.5rem] space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Check In to Event?</h2>
          <p className="text-slate-600 font-medium">Confirm your attendance at {event.title}</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-xl py-3 font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-3"
          >
            Confirm Check-in
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CheckInModal;
