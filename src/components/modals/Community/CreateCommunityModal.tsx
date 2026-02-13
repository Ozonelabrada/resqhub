import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '../../ui';
import { CommunityService } from '../../../services/communityService';
import { IdentityStep } from './CreateCommunity/IdentityStep';
import { SubscriptionTierStep } from './CreateCommunity/SubscriptionTierStep';
import { ReviewStep } from './CreateCommunity/ReviewStep';
import { SuccessStep } from './CreateCommunity/SuccessStep';
import { type CommunityFormData, type Step, INITIAL_FORM_DATA } from './CreateCommunity/types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setFormData(INITIAL_FORM_DATA);
    }
  }, [isOpen]);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Format the payload according to new API requirements at POST /communities
      const isPublicOrg = formData.privacy === 'barangay' || formData.privacy === 'lgu';
      const payload = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        // maxMembers=10000 indicates unlimited members for public organizations (barangay/lgu)
        maxMembers: isPublicOrg ? 10000 : formData.maxMembers,
        privacy: formData.privacy,
        location: formData.location,
        // New API fields
        planId: formData.planId || 1, // Default to plan 1 if not selected
        addOns: formData.selectedAddOns, // Array of add-on codes
        paymentType: formData.paymentType, // 'monthly' or 'yearly'
        totalAmount: formData.totalAmount,
      };

      // For now, use submitForReview as a fallback
      // In production, this should be a direct call to POST /communities
      const result = await CommunityService.submitForReview(payload);
      if (result) {
        setStep('success');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const props = { formData, setFormData, onNext: () => {}, onBack: () => {}, t };

    switch (step) {
      case 'details':
        return <IdentityStep {...props} onNext={() => setStep('tier')} onClose={onClose} />;
      case 'tier':
        return <SubscriptionTierStep {...props} onNext={() => setStep('review')} onBack={() => setStep('details')} submitLoading={loading} />;
      case 'review':
        return (
          <ReviewStep 
            {...props} 
            onNext={() => {}} 
            onFinalSubmit={handleFinalSubmit} 
            onBack={() => setStep('tier')} 
            loading={loading} 
          />
        );
      case 'success':
        return <SuccessStep communityName={formData.name} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[95vh] flex flex-col">
        {step !== 'success' && (
          <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 text-left bg-gradient-to-r from-white to-slate-50 relative z-10 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t('community.createTitle')}
                </DialogTitle>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (step === 'details' && i === 1) || 
                      (step === 'tier' && i <= 2) || 
                      (step === 'review' && i <= 3) 
                        ? 'bg-teal-500 w-12' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogDescription className="text-slate-600 font-bold text-xs uppercase tracking-widest">
               {step === 'details' && t('community.create.step_identity', 'Step 1: Community Details')}
               {step === 'tier' && t('community.create.step_tier', 'Step 2: Choose Your Plan')}
               {step === 'review' && t('community.create.step_review', 'Step 3: Review & Create')}
            </DialogDescription>
          </DialogHeader>
        )}
        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;

