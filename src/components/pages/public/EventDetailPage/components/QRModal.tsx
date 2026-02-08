import React from 'react';
import { Button, Card } from '@/components/ui';

interface QRModalProps {
  qrCode: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ qrCode, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-w-sm w-full p-8 rounded-[2.5rem] space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Event QR Code</h2>
          <p className="text-slate-600 font-medium text-sm">Share this code for attendees to check in</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100">
          <img src={qrCode} alt="Event QR Code" className="w-full rounded-xl" />
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3"
        >
          Close
        </Button>
      </Card>
    </div>
  );
};

export default QRModal;
