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
import { useTranslation } from 'react-i18next';
import { MatchSuccessModal } from './MatchSuccessModal';
import { ImageViewerModal } from '../ImageViewerModal';

interface MatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    sourceReport: any;
    targetReport: any;
    actedByUser: any;
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
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [verificationChecks, setVerificationChecks] = useState({
    identityVerified: false,
    handoverMethodAgreed: false,
    conditionVerified: false
  });
  const [isConfirmDismissOpen, setIsConfirmDismissOpen] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<string>('');
  const [rejectionDetails, setRejectionDetails] = useState<string>('');
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);

  const REJECTION_REASONS = [
    { value: 'not_my_item', label: t('match.reason_not_my_item') || "It's not my item" },
    { value: 'wrong_condition', label: t('match.reason_wrong_condition') || 'Item condition is different' },
    { value: 'already_found', label: t('match.reason_already_found') || 'I already found my item elsewhere' },
    { value: 'wrong_location', label: t('match.reason_wrong_location') || 'Wrong location or area' },
    { value: 'incorrect_details', label: t('match.reason_incorrect_details') || 'Details do not match' },
    { value: 'item_damaged', label: t('match.reason_item_damaged') || 'Item is damaged/broken' },
    { value: 'suspicious_behavior', label: t('match.reason_suspicious_behavior') || 'Suspicious behavior' },
    { value: 'other', label: t('match.reason_other') || 'Other reason' }
  ];

  const isVerificationComplete = Object.values(verificationChecks).every(v => v === true);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleConfirmMatch = async () => {
    setLoading(true);
    try {
      // Per requirement: Set status to 'pending_handover' to start 48-hour handover window
      const res = await ReportMatchService.updateMatchStatus(
        match.id,
        'pending_handover',
        'Match verified - awaiting handover confirmation'
      );
      if (res.success) {
        (window as any).showToast?.(
          'success',
          t('match.match_verified_title') || 'Match Verified',
          t('match.match_verified_message') || 'Match is verified. You have 48 hours to confirm the handover.'
        );
        // Trigger callback to open handover confirmation modal
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
    if (!selectedRejectionReason) {
      (window as any).showToast?.('warn', t('match.select_reason') || 'Select Reason', t('match.reason_required') || 'Please select a reason before rejecting the match.');
      return;
    }

    setLoading(true);
    try {
      // Use the new rejectMatchWithReason method to capture reason
      const res = await ReportMatchService.rejectMatchWithReason(
        match.id,
        selectedRejectionReason,
        rejectionDetails
      );

      if (res.success) {
        (window as any).showToast?.(
          'info',
          t('match.match_rejected_title') || 'Match Rejected',
          t('match.match_rejected_message') || 'The match request has been dismissed. Thank you for your feedback.'
        );
        setIsReasonDialogOpen(false);
        setIsConfirmDismissOpen(false);
        setSelectedRejectionReason('');
        setRejectionDetails('');
        onSuccess?.();
        onClose();
      } else {
        (window as any).showToast?.('error', t('match.error_title') || 'Error', res.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog open={isOpen && !!match && !isImageViewerOpen} onOpenChange={(open) => !open && !isImageViewerOpen && onClose()}>
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

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-4 mb-8">
            {/* Source Report - with Images Gallery */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col">
              {/* Images Grid */}
              {match.sourceReport?.images && match.sourceReport.images.length > 0 ? (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  {match.sourceReport.images.length === 1 ? (
                    <img 
                      src={match.sourceReport.images[0]?.imageUrl || ''} 
                      alt="" 
                      onClick={() => handleImageClick(match.sourceReport.images[0]?.imageUrl || '')}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                    />
                  ) : match.sourceReport.images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {match.sourceReport.images.map((img: any, idx: number) => (
                        <img 
                          key={idx}
                          src={img.imageUrl || ''} 
                          alt="" 
                          onClick={() => handleImageClick(img.imageUrl || '')}
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {match.sourceReport.images.map((img: any, idx: number) => (
                        <img 
                          key={idx}
                          src={img.imageUrl || ''} 
                          alt="" 
                          onClick={() => handleImageClick(img.imageUrl || '')}
                          className="w-full h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-4 w-full h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 text-xs">
                  No images
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <h5 className="font-black text-slate-900 text-sm">{match.sourceReport?.title}</h5>
                <Badge className="mt-2 bg-orange-100 text-orange-600 border-none text-[9px] uppercase font-black">{t('match.your_report') || 'Your Report'}</Badge>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 pt-2">
              <Layers className="text-slate-200" size={24} />
              <ArrowRight className="text-teal-400 animate-pulse" size={20} />
            </div>

            {/* Target Report - with Images Gallery */}
            <div className="bg-teal-50/30 p-4 rounded-3xl border border-teal-100 flex flex-col">
              {/* Images Grid */}
              {match.targetReport?.images && match.targetReport.images.length > 0 ? (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  {match.targetReport.images.length === 1 ? (
                    <img 
                      src={match.targetReport.images[0]?.imageUrl || ''} 
                      alt="" 
                      onClick={() => handleImageClick(match.targetReport.images[0]?.imageUrl || '')}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                    />
                  ) : match.targetReport.images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {match.targetReport.images.map((img: any, idx: number) => (
                        <img 
                          key={idx}
                          src={img.imageUrl || ''} 
                          alt="" 
                          onClick={() => handleImageClick(img.imageUrl || '')}
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {match.targetReport.images.map((img: any, idx: number) => (
                        <img 
                          key={idx}
                          src={img.imageUrl || ''} 
                          alt="" 
                          onClick={() => handleImageClick(img.imageUrl || '')}
                          className="w-full h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-4 w-full h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 text-xs">
                  No images
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <h5 className="font-black text-slate-900 text-sm">{match.targetReport?.title}</h5>
                <Badge className="mt-2 bg-teal-100 text-teal-600 border-none text-[9px] uppercase font-black">{t('match.proposed_match') || 'Proposed Match'}</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={match.targetReport?.user?.profilePicture} className="w-12 h-12" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('match.initiated_by') || 'Initiated by'}</p>
                <h6 className="font-black text-slate-800 text-lg">{match.targetReport?.user?.fullName || match.targetReport?.user?.name || 'Unknown User'}</h6>
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
               onClick={() => setIsReasonDialogOpen(true)}
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

    {/* Rejection Reason Selection Dialog */}
    <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {t('match.why_reject') || 'Why are you rejecting this match?'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {t('match.reason_helps_us') || 'Your feedback helps us improve matches'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 mb-6">
            <p className="text-sm font-bold text-amber-900">
              {t('match.reason_required_msg') || 'Selecting a reason is required to proceed with the rejection.'}
            </p>
          </div>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {REJECTION_REASONS.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRejectionReason === reason.value
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-slate-100 hover:border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="rejection-reason"
                  value={reason.value}
                  checked={selectedRejectionReason === reason.value}
                  onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  className="w-5 h-5"
                />
                <span className="flex-1 text-sm font-bold text-slate-700">{reason.label}</span>
              </label>
            ))}
          </div>

          {selectedRejectionReason && (
            <div className="mb-6">
              <label className="block text-sm font-black text-slate-700 mb-2">
                {t('match.additional_details') || 'Additional details (optional)'}
              </label>
              <textarea
                value={rejectionDetails}
                onChange={(e) => setRejectionDetails(e.target.value)}
                placeholder={t('match.details_placeholder') || 'Please provide any additional information...'}
                maxLength={500}
                className="w-full h-24 p-3 border-2 border-slate-200 rounded-2xl font-medium text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">{rejectionDetails.length}/500</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black transition-all"
              onClick={() => {
                setIsReasonDialogOpen(false);
                setSelectedRejectionReason('');
                setRejectionDetails('');
              }}
              disabled={loading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black transition-all disabled:opacity-50"
              onClick={() => setIsConfirmDismissOpen(true)}
              disabled={loading || !selectedRejectionReason}
            >
              {t('common.next') || 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirm Rejection Dialog */}
    <Dialog open={isConfirmDismissOpen} onOpenChange={setIsConfirmDismissOpen}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <XCircle size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {t('match.confirm_rejection') || 'Confirm Rejection'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {t('match.rejection_cannot_be_undone') || 'This action cannot be undone'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 mb-6">
            <p className="text-sm font-bold text-red-900 mb-3">
              {t('match.rejection_message') || 'Are you sure you want to reject this match?'}
            </p>
            <p className="text-xs text-red-800">
              {t('match.rejection_notification') || 'The other user will be notified of your rejection and the reason provided.'}
            </p>
          </div>

          {selectedRejectionReason && (
            <div className="bg-slate-100 rounded-2xl p-4 mb-6">
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                {t('match.rejection_reason') || 'Reason'}
              </p>
              <p className="text-sm font-bold text-slate-800">
                {REJECTION_REASONS.find(r => r.value === selectedRejectionReason)?.label}
              </p>
              {rejectionDetails && (
                <>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest mt-3 mb-1">
                    {t('match.additional_details') || 'Details'}
                  </p>
                  <p className="text-xs text-slate-700">{rejectionDetails}</p>
                </>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black transition-all"
              onClick={() => setIsConfirmDismissOpen(false)}
              disabled={loading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black transition-all disabled:opacity-50"
              onClick={handleRejectMatch}
              disabled={loading}
            >
              {loading ? t('common.processing') || 'Processing...' : t('match.reject_match') || 'Reject Match'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Image Viewer Modal */}
    <ImageViewerModal 
      isOpen={isImageViewerOpen}
      imageUrl={selectedImageUrl}
      imageAlt="Item image"
      onClose={() => setIsImageViewerOpen(false)}
    />
  </>
  );
};

export default MatchManagementModal;
