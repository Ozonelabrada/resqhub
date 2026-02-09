import React from 'react';
import { Button } from '../../../ui';
import { AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { type CommunityFormData, SUBSCRIPTION_PLANS } from './types';
import { type SubscriptionStatus } from '../../../../services/subscriptionService';

interface ReviewStepProps {
  formData: CommunityFormData;
  setFormData: (data: CommunityFormData) => void;
  onNext: () => void;
  onBack?: () => void;
  onFinalSubmit: () => Promise<void>;
  subStatus?: SubscriptionStatus;
  loading?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  setFormData,
  onBack,
  onFinalSubmit,
  loading = false,
}) => {
  const planInfo = SUBSCRIPTION_PLANS[formData.selectedPlan];
  const selectedAddOns = formData.addOns.filter((addon) => addon.isSelected);
  
  const planPrice = formData.billingCycle === 'monthly'
    ? planInfo.monthlyPrice
    : planInfo.annualPrice / 12; // Monthly breakdown

  const addOnsPrice = selectedAddOns.reduce((sum, addon) => sum + addon.monthlyPrice, 0);
  const totalMonthlyPrice = planPrice + addOnsPrice;
  const totalAnnualPrice = totalMonthlyPrice * 12;

  const annualBillingPrice = formData.billingCycle === 'annual'
    ? planInfo.annualPrice + selectedAddOns.reduce((sum, addon) => {
        return sum + (addon.oneTimePrice || addon.monthlyPrice * 12);
      }, 0)
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Community Name */}
        <div className="bg-teal-50 border-2 border-teal-200 p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Community Name</p>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1 line-clamp-2">{formData.name || 'Your Community'}</p>
        </div>

        {/* Plan Summary */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4">Selected Plan</h3>
          <div className="border-2 border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-600">Plan Name</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 mt-1">{planInfo.name}</p>
              </div>
              {formData.selectedPlan === 'pro' && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-teal-100 text-teal-700 text-[10px] sm:text-xs font-black rounded-full whitespace-nowrap">
                  RECOMMENDED
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-600">Billing Cycle</p>
                <p className="text-base sm:text-lg font-black text-slate-800 mt-1 capitalize">
                  {formData.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-slate-600">Plan Cost</p>
                <p className="text-xl sm:text-2xl font-black text-teal-700 mt-1">
                  {formData.billingCycle === 'monthly'
                    ? `₱${planInfo.monthlyPrice.toLocaleString()}/month`
                    : `₱${planInfo.annualPrice.toLocaleString()}/year`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add-Ons Summary */}
        {selectedAddOns.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4">Selected Add-Ons</h3>
            <div className="space-y-2 sm:space-y-3">
              {selectedAddOns.map((addon) => (
                <div
                  key={addon.code}
                  className="border-2 border-slate-200 rounded-xl p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2 sm:gap-3 bg-slate-50"
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-800">{addon.name}</p>
                      <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-1">{addon.description}</p>
                    </div>
                  </div>
                  <p className="font-black text-teal-700 text-sm sm:text-base flex-shrink-0 whitespace-nowrap ml-2">
                    ₱{addon.monthlyPrice.toLocaleString()}
                    <span className="text-[9px] sm:text-xs text-slate-500 font-normal">/month</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="bg-slate-50 border-2 border-slate-200 p-4 sm:p-6 rounded-2xl space-y-3 sm:space-y-4">
          <h3 className="font-black text-sm sm:text-base text-slate-800 mb-3 sm:mb-4">Total Cost Summary</h3>

          <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b-2 border-slate-200">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-700">{planInfo.name}</span>
              <span className="font-black text-slate-800">
                {formData.billingCycle === 'monthly'
                  ? `₱${planInfo.monthlyPrice.toLocaleString()}`
                  : `₱${planInfo.annualPrice.toLocaleString()}`}
              </span>
            </div>

            {selectedAddOns.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <span className="font-bold text-slate-700">Add-Ons ({selectedAddOns.length})</span>
                  <span className="font-black text-slate-800">
                    {formData.billingCycle === 'monthly'
                      ? `₱${addOnsPrice.toLocaleString()}`
                      : `₱${(addOnsPrice * 12).toLocaleString()}`}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 ml-3 sm:ml-4 space-y-1">
                  {selectedAddOns.map((addon) => (
                    <div key={addon.code} className="flex justify-between">
                      <span>{addon.name}</span>
                      <span>
                        {formData.billingCycle === 'monthly'
                          ? `₱${addon.monthlyPrice.toLocaleString()}`
                          : `₱${(addon.monthlyPrice * 12).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-black text-sm sm:text-base text-slate-800">
              {formData.billingCycle === 'monthly' ? 'Monthly Total' : 'Annual Total'}
            </span>
            <span className="font-black text-xl sm:text-3xl text-teal-700">
              ₱{(formData.billingCycle === 'monthly' ? totalMonthlyPrice : annualBillingPrice || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Monthly Equivalent for Annual */}
          {formData.billingCycle === 'annual' && (
            <div className="text-right text-xs sm:text-sm text-slate-600 pt-2">
              ≈ ₱{totalMonthlyPrice.toLocaleString('en-PH', { maximumFractionDigits: 0 })}/month
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 rounded-2xl flex gap-2 sm:gap-3">
          <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-blue-900">Next Steps</p>
            <p className="text-blue-800 mt-0.5 sm:mt-1 leading-relaxed">
              After reviewing your selections, you'll proceed to payment. Your subscription will be activated immediately upon successful payment.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex gap-2 sm:gap-3 justify-end shrink-0">
        <Button
          onClick={onBack}
          variant="outline"
          disabled={loading}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold sm:font-black text-xs sm:text-sm text-slate-700 border-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          onClick={onFinalSubmit}
          disabled={loading || !formData.name}
          className="px-6 sm:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold sm:font-black text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Calendar size={18} />
              Proceed to Payment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
