import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Avatar,
  Badge
} from '../../ui';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ReportMatchService } from '../../../services/reportMatchService';
import { cn } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';

interface MatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    sourceReport: any;
    targetReport: any;
    initiator: any;
    status: string;
  };
  onSuccess?: () => void;
}

export const MatchManagementModal: React.FC<MatchManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  match,
  onSuccess 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleConfirmMatch = async () => {
    setLoading(true);
    try {
      // Per requirement: If recipient confirms, status must be 'resolved'
      const res = await ReportMatchService.updateMatchStatus(match.id, 'resolved', 'Confirmed by owner');
      if (res.success) {
        (window as any).showToast?.('success', 'Match Resolved', 'The item has been successfully linked and resolved.');
        onSuccess?.();
        onClose();
      } else {
        (window as any).showToast?.('error', 'Update Failed', res.message);
      }
    } catch (error) {
      console.error('Confirm match error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMatch = async () => {
    setLoading(true);
    try {
      const res = await ReportMatchService.updateMatchStatus(match.id, 'dismissed', 'Rejected by owner');
      if (res.success) {
        (window as any).showToast?.('warning', 'Match Rejected', 'The match request has been dismissed.');
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">Verify Match Request</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Someone thinks they found your item. Please verify if this is a match.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">
            {/* Source Report */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3 bg-white shadow-sm">
                <img src={match.sourceReport?.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <h5 className="font-black text-slate-900 text-sm">{match.sourceReport?.title}</h5>
              <Badge className="mt-2 bg-orange-100 text-orange-600 border-none text-[9px] uppercase font-black">Your Report</Badge>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Layers className="text-slate-200" size={24} />
              <ArrowRight className="text-teal-400 animate-pulse" size={20} />
            </div>

            {/* Target Report */}
            <div className="bg-teal-50/30 p-4 rounded-3xl border border-teal-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3 bg-white shadow-sm border-2 border-teal-100">
                <img src={match.targetReport?.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <h5 className="font-black text-slate-900 text-sm">{match.targetReport?.title}</h5>
              <Badge className="mt-2 bg-teal-100 text-teal-600 border-none text-[9px] uppercase font-black">Proposed Match</Badge>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={match.initiator?.profilePicture} className="w-12 h-12" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Initiated by</p>
                <h6 className="font-black text-slate-800 text-lg">{match.initiator?.fullName}</h6>
              </div>
            </div>
            <div className="flex gap-6 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-400" />
                {match.targetReport?.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-teal-400" />
                {new Date(match.targetReport?.dateCreated).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
               variant="outline"
               className="flex-1 h-14 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-black gap-2 transition-all hover:border-slate-200"
               onClick={handleRejectMatch}
               disabled={loading}
            >
              <XCircle size={20} />
              Not My Item
            </Button>
            <Button 
               className="flex-1 h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black hover:shadow-lg hover:shadow-teal-200 gap-2 transition-all"
               onClick={handleConfirmMatch}
               disabled={loading}
            >
              <CheckCircle2 size={20} />
              Confirm Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
