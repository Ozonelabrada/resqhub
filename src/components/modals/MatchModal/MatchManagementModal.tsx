import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Avatar,
  Badge,
  Checkbox
} from '../../ui';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { ReportMatchService } from '../../../services/reportMatchService';
import { cn } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';
import { MatchSuccessModal } from './MatchSuccessModal';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [verificationChecks, setVerificationChecks] = useState({
    identityVerified: false,
    handoverMethodAgreed: false,
    conditionVerified: false
  });

  const isVerificationComplete = Object.values(verificationChecks).every(v => v === true);

  const handleConfirmMatch = async () => {
    setLoading(true);
    try {
      // Per requirement: If recipient confirms, status must be 'resolved'
      const res = await ReportMatchService.updateMatchStatus(match.id, 'Resolved', 'Confirmed by owner');
      if (res.success) {
        (window as any).showToast?.('success', t('match.resolved_title') || 'Match Resolved', t('match.resolved_message') || 'The item has been successfully linked and resolved.');
        // Show success modal instead of immediately closing
        setShowSuccess(true);
        onSuccess?.();
      } else {
        (window as any).showToast?.('error', t('match.error_title') || 'Update Failed', res.message);
      }
    } catch (error) {
      console.error('Confirm match error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleShare = () => {
    const itemTitle = match.sourceReport?.title || 'Item';
    const message = t('match.share_message') || `Great news! I just reunited with my ${itemTitle} thanks to the ResQHub community!`;
    if (navigator.share) {
      navigator.share({
        title: 'ReqHub - Item Reunited!',
        text: message,
        url: window.location.href
      }).catch(err => console.log('Share failed:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(message);
      (window as any).showToast?.('success', t('common.copied') || 'Copied', t('match.share_copied') || 'Message copied to clipboard!');
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
    <>
      <Dialog open={isOpen && !!match} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          {!match ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-slate-500 font-medium">Loading match information...</p>
            </div>
          ) : (
            <>
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">{t('match.verify_match_title') || 'Verify Match Request'}</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {t('match.verify_match_description') || 'Someone thinks they found your item. Please verify if this is a match.'}
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
              <Badge className="mt-2 bg-orange-100 text-orange-600 border-none text-[9px] uppercase font-black">{t('match.your_report') || 'Your Report'}</Badge>
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
              <Badge className="mt-2 bg-teal-100 text-teal-600 border-none text-[9px] uppercase font-black">{t('match.proposed_match') || 'Proposed Match'}</Badge>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={match.initiator?.profilePicture} className="w-12 h-12" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('match.initiated_by') || 'Initiated by'}</p>
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
                {new Date(match.targetReport?.dateCreated || new Date()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Handover Verification Section */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 mb-8">
            <div className="flex items-start gap-3 mb-5">
              <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-black text-amber-900 text-sm uppercase tracking-wide">
                  {t('match.verification_title') || 'Handover Verification'}
                </h4>
                <p className="text-xs text-amber-800 font-medium mt-1">
                  {t('match.verification_description') || 'Please confirm the following before completing the match:'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                <Checkbox
                  checked={verificationChecks.identityVerified}
                  onCheckedChange={(checked: boolean) => 
                    setVerificationChecks(prev => ({ ...prev, identityVerified: checked }))
                  }
                  className="mt-1 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">
                    {t('match.verify_identity') || 'I have verified the identity of the person/organization'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('match.verify_identity_hint') || 'Confirm they are who they claim to be'}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                <Checkbox
                  checked={verificationChecks.handoverMethodAgreed}
                  onCheckedChange={(checked: boolean) => 
                    setVerificationChecks(prev => ({ ...prev, handoverMethodAgreed: checked }))
                  }
                  className="mt-1 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">
                    {t('match.verify_handover') || 'We have agreed on a safe return method'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('match.verify_handover_hint') || 'You both know when, where, and how to exchange the item'}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                <Checkbox
                  checked={verificationChecks.conditionVerified}
                  onCheckedChange={(checked: boolean) => 
                    setVerificationChecks(prev => ({ ...prev, conditionVerified: checked }))
                  }
                  className="mt-1 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">
                    {t('match.verify_condition') || 'The item condition matches the description'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('match.verify_condition_hint') || 'This looks like the right item in the expected condition'}
                  </p>
                </div>
              </label>
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
              {t('match.not_my_item') || 'Not My Item'}
            </Button>
            <Button 
               className="flex-1 h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black hover:shadow-lg hover:shadow-teal-200 gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={handleConfirmMatch}
               disabled={loading || !isVerificationComplete}
            >
              <CheckCircle2 size={20} />
              {t('match.confirm_match') || 'Confirm Match'}
            </Button>
          </div>

          {/* Verification hint */}
          {!isVerificationComplete && (
            <p className="text-xs text-slate-500 font-medium text-center mt-4">
              {t('match.complete_verification_hint') || 'Complete all verification checks above to confirm the match'}
            </p>
          )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Success Modal - Outside Dialog to ensure proper z-index and visibility */}
    {match && (
      <MatchSuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessModalClose}
        onShare={handleShare}
        onBackToHub={handleSuccessModalClose}
        itemTitle={match.sourceReport?.title}
        itemImage={match.sourceReport?.images?.[0]}
      />
    )}
  </>
  );
};
