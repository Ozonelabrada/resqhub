import React from 'react';
import { Button } from '../../../ui';
import { Check } from 'lucide-react';
import { 
  type CommunityFormData, 
  type SubscriptionPlan, 
  SUBSCRIPTION_PLANS,
  type BillingCycle 
} from './types';

interface PlanSelectionStepProps {
  formData: CommunityFormData;
  setFormData: (data: CommunityFormData) => void;
  onNext: () => void;
  onClose?: () => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  formData,
  setFormData,
  onNext,
  onClose,
}) => {
  const handlePlanSelect = (planId: SubscriptionPlan) => {
    setFormData({
      ...formData,
      selectedPlan: planId,
    });
  };

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    setFormData({
      ...formData,
      billingCycle: cycle,
    });
  };

  const getPrice = (planId: SubscriptionPlan): number => {
    const plan = SUBSCRIPTION_PLANS[planId];
    return formData.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getAnnualEquivalent = (planId: SubscriptionPlan): number => {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (formData.billingCycle === 'monthly') {
      return plan.monthlyPrice * 12;
    }
    return plan.annualPrice;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span className={`text-xs sm:text-sm font-bold ${formData.billingCycle === 'monthly' ? 'text-slate-800' : 'text-slate-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => handleBillingCycleChange(formData.billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-12 sm:w-14 h-6 sm:h-7 bg-teal-600 rounded-full transition-colors hover:bg-teal-700 shrink-0"
          >
            <div
              className={`absolute top-1 left-1 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform duration-300 ${
                formData.billingCycle === 'annual' ? 'translate-x-6 sm:translate-x-7' : ''
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-bold ${formData.billingCycle === 'annual' ? 'text-slate-800' : 'text-slate-500'}`}>
            Annual
          </span>
          {formData.billingCycle === 'annual' && (
            <span className="ml-1 sm:ml-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black bg-green-100 text-green-700 rounded-lg">
              Save 15%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative p-4 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                formData.selectedPlan === plan.id
                  ? 'border-teal-600 bg-teal-50 shadow-lg shadow-teal-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-black rounded-full whitespace-nowrap">
                  Most Recommended
                </div>
              )}

              {/* Select Indicator */}
              {formData.selectedPlan === plan.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              )}

              {/* Plan Title */}
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1 sm:mb-2">{plan.name}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mb-3 sm:mb-4 line-clamp-2">{plan.description}</p>

              {/* Pricing */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800">
                    ₱{getPrice(plan.id).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 font-bold">
                    /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {formData.billingCycle === 'monthly' && (
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    ≈ ₱{getAnnualEquivalent(plan.id).toLocaleString()}/year
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-1.5 sm:space-y-2">
                {plan.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <div
                      className={`w-4 sm:w-5 h-4 sm:h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.available
                          ? 'bg-teal-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      {feature.available && (
                        <Check size={12} className="text-teal-600 sm:block" />
                      )}
                      {!feature.available && (
                        <span className="text-slate-300 text-[10px]">✕</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] sm:text-xs font-bold line-clamp-2 ${
                          feature.available
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {feature.name}
                      </p>
                      {feature.description && (
                        <p className="text-[9px] sm:text-xs text-slate-500 line-clamp-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-900 font-bold leading-relaxed">
            💡 Tip: All plans include community management, member registration, and basic analytics. 
            Choose additional modules in the next step to customize your community platform.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex gap-2 sm:gap-3 justify-end shrink-0">
        <Button
          onClick={onClose}
          variant="outline"
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold sm:font-black text-xs sm:text-sm text-slate-700 border-slate-300 hover:bg-slate-100 transition-all"
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="px-6 sm:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold sm:font-black text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
