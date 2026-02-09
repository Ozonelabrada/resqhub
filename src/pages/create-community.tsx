import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import { CommunityService } from '../services/communityService';
import { PlanSelectionStep } from '../components/modals/Community/CreateCommunity/PlanSelectionStep';
import { IdentityStep } from '../components/modals/Community/CreateCommunity/IdentityStep';
import { AddOnsStep } from '../components/modals/Community/CreateCommunity/AddOnsStep';
import { ReviewStep } from '../components/modals/Community/CreateCommunity/ReviewStep';
import { SuccessStep } from '../components/modals/Community/CreateCommunity/SuccessStep';
import { type CommunityFormData, type Step, INITIAL_FORM_DATA } from '../components/modals/Community/CreateCommunity/types';

const CreateCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('plans');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>(INITIAL_FORM_DATA);

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
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/hub/communities');
    }, 2000);
  };

  const renderStep = () => {
    const props = { formData, setFormData, onNext: () => {}, onBack: () => {}, t: (key: string) => key };

    switch (step) {
      case 'plans':
        return <PlanSelectionStep {...props} onNext={() => setStep('details')} onClose={handleClose} />;
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
            loading={loading} 
          />
        );
      case 'success':
        return <SuccessStep communityName={formData.name} formData={formData} onClose={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {step !== 'success' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Create Community</h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">Set up your community platform with the perfect subscription plan</p>
              </div>
              {/* Progress Indicator */}
              <div className="flex gap-1.5 shrink-0">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (step === 'plans' && i === 1) ||
                      (step === 'details' && i <= 2) ||
                      (step === 'addons' && i <= 3) ||
                      (step === 'review' && i <= 4)
                        ? 'bg-teal-500 w-16 sm:w-20'
                        : 'bg-slate-200 w-6 sm:w-8'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Title */}
            <div className="pt-3 sm:pt-4 border-t border-slate-200">
              <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-800 mt-3 sm:mt-4">
                {step === 'plans' && '1. Select Your Subscription Plan'}
                {step === 'details' && '2. Organization Details'}
                {step === 'addons' && '3. Add-On Modules'}
                {step === 'review' && '4. Review Your Selection'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 sm:mt-2">
                {step === 'plans' && 'Choose the plan that best fits your community needs'}
                {step === 'details' && 'Tell us more about your community and organization'}
                {step === 'addons' && 'Customize your platform with premium features'}
                {step === 'review' && 'Review your selections before creating your community'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Area - Flex to fill available space */}
      <div className={`flex-1 overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8 ${step === 'details' ? 'max-w-2xl mx-auto w-full' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
          {renderStep()}
        </div>
      </div>

      {/* Footer Info */}
      {step !== 'success' && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm text-slate-600">
          <p>🔒 Your information is secure. We use industry-standard encryption to protect your data.</p>
        </div>
      )}
    </div>
  );
};

export default CreateCommunityPage;
