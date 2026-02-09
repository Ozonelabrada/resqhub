import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui';
import { CheckCircle2, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { type CommunityFormData, SUBSCRIPTION_PLANS } from './types';

interface SuccessStepProps {
  communityName: string;
  formData: CommunityFormData;
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ 
  communityName, 
  formData, 
  onClose 
}) => {
  const navigate = useNavigate();
  const planInfo = SUBSCRIPTION_PLANS[formData.selectedPlan];
  const selectedAddOns = formData.addOns.filter((addon) => addon.isSelected);
  
  const planPrice = formData.billingCycle === 'monthly'
    ? planInfo.monthlyPrice
    : planInfo.annualPrice / 12;

  const addOnsPrice = selectedAddOns.reduce((sum, addon) => sum + addon.monthlyPrice, 0);
  const totalMonthlyPrice = planPrice + addOnsPrice;
  const annualBillingPrice = formData.billingCycle === 'annual'
    ? planInfo.annualPrice + selectedAddOns.reduce((sum, addon) => {
        return sum + (addon.oneTimePrice || addon.monthlyPrice * 12);
      }, 0)
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Community Created!</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 sm:mt-2 line-clamp-2">
              Your community <span className="font-black text-slate-900">"{communityName}"</span> is ready to go
            </p>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h4 className="font-black text-sm sm:text-base text-slate-800">Your Subscription Plan</h4>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-teal-200 text-xs sm:text-sm">
              <span className="font-bold text-slate-700">Plan</span>
              <span className="font-black text-slate-900">{planInfo.name}</span>
            </div>

            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-teal-200 text-xs sm:text-sm">
              <span className="font-bold text-slate-700">Billing Cycle</span>
              <span className="font-black text-slate-900 capitalize">
                {formData.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Billing
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-700">Monthly Cost</span>
              <span className="font-black text-teal-700 text-base sm:text-lg">
                ₱{totalMonthlyPrice.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {selectedAddOns.length > 0 && (
            <div className="pt-2 sm:pt-3 border-t border-teal-200 space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Add-Ons Included</p>
              <div className="space-y-1 sm:space-y-2">
                {selectedAddOns.map((addon) => (
                  <div key={addon.code} className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-700">✓ {addon.name}</span>
                    <span className="font-bold text-slate-600">₱{addon.monthlyPrice.toLocaleString()}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Community Details */}
        <div className="border-2 border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h4 className="font-black text-sm sm:text-base text-slate-800">Community Details</h4>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={16} className="text-teal-600 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Admin Email</p>
                <p className="font-black text-xs sm:text-sm text-slate-800 break-all">{formData.contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={16} className="text-teal-600 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Contact Phone</p>
                <p className="font-black text-xs sm:text-sm text-slate-800">{formData.contactPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={16} className="text-teal-600 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Location</p>
                <p className="font-black text-xs sm:text-sm text-slate-800 line-clamp-2">{formData.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={16} className="text-teal-600 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Org. Type</p>
                <p className="font-black text-xs sm:text-sm text-slate-800 capitalize">{formData.organizationType || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-black text-blue-900">What's Next?</p>
          <ul className="text-[11px] sm:text-xs text-blue-800 space-y-0.5 sm:space-y-1 ml-4 list-disc">
            <li>Set up your community profile and branding</li>
            <li>Invite moderators and members</li>
            <li>Configure community settings and features</li>
            <li>Start building your community!</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex gap-2 sm:gap-3 justify-end shrink-0">
        <Button
          onClick={() => {
            onClose();
            navigate('/hub');
          }}
          className="px-6 sm:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold sm:font-black text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 w-full"
        >
          Go to My Community
        </Button>
      </div>
    </div>
  );
};
