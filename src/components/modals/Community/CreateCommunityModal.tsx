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
import { SubscriptionService, type SubscriptionStatus } from '../../../services/subscriptionService';
import { IdentityStep } from './CreateCommunity/IdentityStep';
import { FeaturesStep } from './CreateCommunity/FeaturesStep';
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
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>({ isActive: false, isPremium: false });
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
      // Format the payload according to API requirements
      const payload = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        maxMembers: formData.maxMembers,
        privacy: formData.privacy,
        location: formData.location,
        features: formData.features.filter(f => f.isActive),
      };

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
        return <IdentityStep {...props} onNext={() => setStep('features')} onClose={onClose} />;
      case 'features':
        return <FeaturesStep {...props} onNext={() => setStep('review')} onBack={() => setStep('details')} subStatus={subStatus} />;
      case 'review':
        return (
          <ReviewStep 
            {...props} 
            onNext={() => {}} 
            onFinalSubmit={handleFinalSubmit} 
            onBack={() => setStep('features')} 
            subStatus={subStatus} 
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[90vh]">
        {step !== 'success' && (
          <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                {t('community.createTitle')}
              </DialogTitle>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                      (step === 'details' && i === 1) || 
                      (step === 'features' && i <= 2) || 
                      (step === 'review' && i <= 3) 
                        ? 'bg-teal-500 w-10' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogDescription className="text-slate-500 font-bold text-xs uppercase tracking-wider">
               {step === 'details' && t('community.create.step_identity')}
               {step === 'features' && t('community.create.step_features')}
               {step === 'review' && t('community.create.step_review')}
            </DialogDescription>
          </DialogHeader>
        )}
        
        <div className="flex-1 overflow-hidden">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;
