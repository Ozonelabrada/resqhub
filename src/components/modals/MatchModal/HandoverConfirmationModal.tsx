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
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  HandshakeIcon,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReportMatchService } from '../../../services/reportMatchService';
import { useMatchExpiration } from '../../../hooks/useMatchExpiration';

interface HandoverConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    sourceReport: any;
    targetReport: any;
    actedByUser: any;
    status: string;
    createdAt?: string;
    sourceUserHandoverConfirmed?: boolean;
    targetUserHandoverConfirmed?: boolean;
  };
  isSourceUser: boolean; // true if current user is the one who initiated the match
  onSuccess?: () => void;
}

export const HandoverConfirmationModal: React.FC<HandoverConfirmationModalProps> = ({
  isOpen,
  onClose,
  match,
  isSourceUser,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isConfirmExpanded, setIsConfirmExpanded] = useState(false);

  const { formatTimeRemaining, getCountdownColor, getCountdownBgColor, isExpired, expirationData } = useMatchExpiration(
    match.createdAt,
    () => {
      // Auto-expire match after 48 hours
      if (match.id && match.status === 'pending_handover') {
        handleExpireMatch();
      }
    }
  );

  const otherReport = isSourceUser ? match.targetReport : match.sourceReport;
  const otherUser = isSourceUser ? match.targetReport?.user : match.sourceReport?.user;
  const currentUserConfirmed = isSourceUser
    ? match.sourceUserHandoverConfirmed
    : match.targetUserHandoverConfirmed;
  const otherUserConfirmed = isSourceUser
    ? match.targetUserHandoverConfirmed
    : match.sourceUserHandoverConfirmed;

  const handleConfirmHandover = async () => {
    setLoading(true);
    try {
      const userRole = isSourceUser ? 'source' : 'target';
      const res = await ReportMatchService.confirmHandover(match.id, userRole);

      if (res.success) {
        (window as any).showToast?.(
          'success',
          t('match.handover_confirmed') || 'Handover Confirmed',
          t('match.handover_confirmed_message') || 'You have confirmed the handover. Waiting for the other party...'
        );

        // If both have confirmed, auto-update to resolved
        if (otherUserConfirmed) {
          // Trigger success callback - parent will show success modal
          onSuccess?.();
        }
      } else {
        (window as any).showToast?.(
          'error',
          t('match.error_title') || 'Error',
          res.message || 'Failed to confirm handover'
        );
      }
    } catch (error) {
      console.error('Confirm handover error:', error);
      (window as any).showToast?.(
        'error',
        'Error',
        'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExpireMatch = async () => {
    try {
      await ReportMatchService.updateMatchStatus(match.id, 'expired', 'Match expired after 48-hour handover window');
      (window as any).showToast?.(
        'warning',
        t('match.handover_expired_title') || 'Handover Window Expired',
        t('match.handover_expired_message') || 'The 48-hour handover window has expired. Match cancelled.'
      );
      onClose();
    } catch (error) {
      console.error('Expire match error:', error);
    }
  };

  const handleCancelMatch = async () => {
    if (!confirm(t('match.cancel_handover_confirm') || 'Are you sure you want to cancel this handover?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await ReportMatchService.updateMatchStatus(
        match.id,
        'dismissed',
        `Handover cancelled by ${isSourceUser ? 'source' : 'target'} user`
      );

      if (res.success) {
        (window as any).showToast?.(
          'warning',
          'Handover Cancelled',
          'The handover has been cancelled.'
        );
        onClose();
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  if (isExpired) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900">
                    {t('match.handover_expired_title') || 'Handover Window Expired'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    {t('match.handover_expired_subtitle') || 'The 48-hour handover window has passed'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 mb-8">
              <p className="text-sm font-bold text-red-900">
                {t('match.handover_expired_message') || 'The match has expired. Please create a new match request if you would like to proceed.'}
              </p>
            </div>

            <Button
              className="w-full h-12 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-black transition-all"
              onClick={onClose}
            >
              {t('common.close') || 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                <HandshakeIcon size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {t('match.handover_title') || 'Confirm Item Handover'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {t('match.handover_subtitle') || 'Both parties must confirm the handover to complete the match'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Countdown Timer */}
          {expirationData && (
            <div className={`rounded-2xl p-4 mb-6 border-2 flex items-center gap-3 ${getCountdownBgColor()} border-amber-200`}>
              <Clock className={`w-5 h-5 ${getCountdownColor()}`} />
              <div className="flex-1">
                <p className={`text-sm font-black ${getCountdownColor()}`}>
                  {t('match.time_remaining') || 'Time Remaining'}: {formatTimeRemaining(expirationData.timeRemaining)}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {t('match.handover_countdown_hint') || 'Handover must be confirmed within 48 hours of match creation'}
                </p>
              </div>
            </div>
          )}

          {/* Other User Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              {t('match.exchange_with') || 'Exchanging with'}
            </p>
            <div className="flex items-center gap-4">
              <Avatar src={otherUser?.profilePicture} className="w-14 h-14" />
              <div className="flex-1">
                <h6 className="font-black text-slate-900 text-lg">
                  {otherUser?.fullName || otherUser?.name || 'Unknown User'}
                </h6>
                <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-orange-400" />
                    {otherReport?.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-teal-400" />
                    {new Date(otherReport?.dateCreated || new Date()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Status */}
          <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {t('match.handover_status') || 'Handover Status'}
            </p>

            <div className="space-y-3">
              {/* Current User Status */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                <div className={`w-4 h-4 rounded-full ${currentUserConfirmed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="flex-1 text-sm font-bold text-slate-700">
                  {isSourceUser ? t('match.you_lost_item') : t('match.you_found_item')} | {t('common.you') || 'You'}
                </span>
                {currentUserConfirmed && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>

              {/* Other User Status */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                <div className={`w-4 h-4 rounded-full ${otherUserConfirmed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="flex-1 text-sm font-bold text-slate-700">
                  {!isSourceUser ? t('match.they_lost_item') : t('match.they_found_item')} | {otherUser?.fullName}
                </span>
                {otherUserConfirmed && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
            </div>

            {!otherUserConfirmed && (
              <p className="text-xs text-slate-500 font-medium mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Zap className="inline w-3 h-3 mr-1" />
                {t('match.waiting_for_other_party') || 'Waiting for the other party to confirm handover...'}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 mb-6">
            <h4 className="font-black text-emerald-900 text-sm uppercase tracking-wide mb-3">
              {t('match.what_happens_next') || 'What Happens Next'}
            </h4>
            <ul className="space-y-2 text-sm font-bold text-emerald-800">
              <li className="flex gap-2">
                <span className="flex-shrink-0">1.</span>
                <span>{t('match.handover_step_1') || 'Confirm that you have received/handed over the item'}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">2.</span>
                <span>{t('match.handover_step_2') || 'Wait for the other party to confirm their handover'}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">3.</span>
                <span>{t('match.handover_step_3') || 'Once both confirm, the match will be marked as resolved'}</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black transition-all disabled:opacity-50"
              onClick={handleCancelMatch}
              disabled={loading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              className={`flex-1 h-12 rounded-2xl font-black transition-all disabled:opacity-50 gap-2 ${
                currentUserConfirmed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
              onClick={handleConfirmHandover}
              disabled={loading || currentUserConfirmed}
            >
              <CheckCircle2 size={18} />
              {currentUserConfirmed
                ? t('match.handover_confirmed') || 'Confirmed'
                : t('match.confirm_handover') || 'Confirm Handover'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverConfirmationModal;
