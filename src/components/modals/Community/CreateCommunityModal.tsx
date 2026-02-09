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
import { PlanSelectionStep } from './CreateCommunity/PlanSelectionStep';
import { IdentityStep } from './CreateCommunity/IdentityStep';
import { AddOnsStep } from './CreateCommunity/AddOnsStep';
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
  const [step, setStep] = useState<Step>('plans');
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>({ isActive: false, isPremium: false });
  const [formData, setFormData] = useState<CommunityFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (isOpen) {
      setStep('plans');
      setFormData(INITIAL_FORM_DATA);
    }
  }, [isOpen]);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Map plan selection to planId
      const planIdMap: Record<string, number> = {
        'basic': 1,
        'pro': 2,
        'enterprise': 3,
      };

      // Get selected add-ons codes
      const selectedAddOns = formData.addOns
        .filter(addon => addon.isSelected)
        .map(addon => addon.code);

      // Calculate total amount
      const planPrices: Record<string, { monthly: number; annual: number }> = {
        'basic': { monthly: 999, annual: 10000 },
        'pro': { monthly: 2499, annual: 25000 },
        'enterprise': { monthly: 7500, annual: 75000 },
      };

      const planPrice = planPrices[formData.selectedPlan];
      const addOnsPrice = formData.addOns
        .filter(addon => addon.isSelected)
        .reduce((sum, addon) => sum + addon.monthlyPrice, 0);

      let totalAmount = 0;
      if (formData.billingCycle === 'annual') {
        totalAmount = planPrice.annual + selectedAddOns.reduce((sum, code) => {
          const addon = formData.addOns.find(a => a.code === code);
          return sum + (addon?.oneTimePrice || addon?.monthlyPrice! * 12 || 0);
        }, 0);
      } else {
        totalAmount = planPrice.monthly + addOnsPrice;
      }

      // Format the payload according to API requirements
      const payload = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        privacy: formData.privacy,
        location: formData.location,
        maxMembers: formData.maxMembers,
        planId: planIdMap[formData.selectedPlan],
        addOns: selectedAddOns,
        paymentType: formData.billingCycle,
        totalAmount: Math.round(totalAmount),
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
      case 'plans':
        return <PlanSelectionStep {...props} onNext={() => setStep('details')} onClose={onClose} />;
      case 'details':
        return <IdentityStep {...props} onNext={() => setStep('addons')} onBack={() => setStep('plans')} />;
      case 'addons':
        return <AddOnsStep {...props} onNext={() => setStep('review')} onBack={() => setStep('details')} />;
      case 'review':
        return (
          <ReviewStep 
            {...props} 
            onNext={() => {}} 
            onFinalSubmit={handleFinalSubmit} 
            onBack={() => setStep('addons')} 
            subStatus={subStatus} 
            loading={loading} 
          />
        );
      case 'success':
        return <SuccessStep communityName={formData.name} formData={formData} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] bg-white max-h-[90vh] flex flex-col">
        {step !== 'success' && (
          <DialogHeader className="px-4 sm:px-8 py-4 sm:py-8 pb-3 sm:pb-4 text-left bg-white relative z-10 border-b border-slate-50 shrink-0">
            <div className="flex items-center justify-between gap-4 mb-2">
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight line-clamp-2">
                Create Community
              </DialogTitle>
              <div className="flex gap-1 shrink-0">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-4 sm:w-6 rounded-full transition-all duration-500 ${
                      (step === 'plans' && i === 1) || 
                      (step === 'details' && i <= 2) || 
                      (step === 'addons' && i <= 3) ||
                      (step === 'review' && i <= 4) 
                        ? 'bg-teal-500 sm:w-10 w-8' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogDescription className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider line-clamp-1">
               {step === 'plans' && 'Select Your Subscription Plan'}
               {step === 'details' && 'Organization Details'}
               {step === 'addons' && 'Choose Add-on Modules'}
               {step === 'review' && 'Review Your Selection'}
            </DialogDescription>
          </DialogHeader>
        )}
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;
