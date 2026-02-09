import React from 'react';
import { Button } from '../../../ui';
import { Check } from 'lucide-react';
import { type CommunityFormData, SUBSCRIPTION_PLANS, ADD_ON_MODULES } from './types';

interface AddOnsStepProps {
  formData: CommunityFormData;
  setFormData: (data: CommunityFormData) => void;
  onNext: () => void;
  onBack?: () => void;
}

export const AddOnsStep: React.FC<AddOnsStepProps> = ({
  formData,
  setFormData,
  onNext,
  onBack,
}) => {
  const handleAddOnToggle = (code: string) => {
    const updatedAddOns = formData.addOns.map((addon) =>
      addon.code === code ? { ...addon, isSelected: !addon.isSelected } : addon
    );
    setFormData({
      ...formData,
      addOns: updatedAddOns,
    });
  };

  const selectedAddOns = formData.addOns.filter((addon) => addon.isSelected);
  const totalAddOnCost = selectedAddOns.reduce((sum, addon) => {
    return sum + (addon.monthlyPrice || 0);
  }, 0);

  const planInfo = SUBSCRIPTION_PLANS[formData.selectedPlan];
  const planPrice = formData.billingCycle === 'monthly'
    ? planInfo.monthlyPrice
    : planInfo.annualPrice / 12; // Show monthly breakdown for comparison

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Plan Summary */}
        <div className="bg-teal-50 border-2 border-teal-200 p-3 sm:p-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Current Plan</p>
              <p className="text-base sm:text-lg font-black text-slate-800 mt-1">{planInfo.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold">Monthly Cost</p>
              <p className="text-xl sm:text-2xl font-black text-teal-700">
                ₱{planPrice.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1 sm:mb-2">Optional Add-On Modules</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Enhance your community platform with additional features. You can add or remove modules anytime.
          </p>
        </div>

        {/* Add-Ons Grid */}
        <div className="space-y-2 sm:space-y-3">
          {ADD_ON_MODULES.map((addon) => {
            const isSelected = formData.addOns.find((a) => a.code === addon.code)?.isSelected || false;
            return (
              <div
                key={addon.code}
                onClick={() => handleAddOnToggle(addon.code)}
                className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Checkbox */}
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={16} className="text-white" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{addon.name}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-2">{addon.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0 whitespace-nowrap ml-2">
                    <p className="font-black text-teal-700 text-sm sm:text-base">
                      ₱{addon.monthlyPrice.toLocaleString()}
                    </p>
                    <p className="text-[9px] sm:text-xs text-slate-500">/month</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost Summary */}
        <div className="bg-slate-50 border-2 border-slate-200 p-4 sm:p-6 rounded-2xl sticky bottom-0 space-y-3 sm:space-y-4">
          <div className="space-y-2 pb-3 sm:pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-700">Base Plan ({planInfo.name})</span>
              <span className="font-black text-slate-800">
                ₱{planPrice.toLocaleString('en-PH', { maximumFractionDigits: 0 })}/month
              </span>
            </div>
            {selectedAddOns.length > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-700">Add-Ons ({selectedAddOns.length})</span>
                <span className="font-black text-slate-800">
                  ₱{totalAddOnCost.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-black text-sm sm:text-lg text-slate-800">Total Monthly Cost</span>
            <span className="font-black text-xl sm:text-2xl text-teal-700">
              ₱{(planPrice + totalAddOnCost).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex gap-2 sm:gap-3 justify-end shrink-0">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold sm:font-black text-xs sm:text-sm text-slate-700 border-slate-300 hover:bg-slate-100 transition-all"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="px-6 sm:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold sm:font-black text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20"
        >
          Review & Continue
        </Button>
      </div>
    </div>
  );
};
