import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ScrollArea, 
  DialogFooter, 
  Button,
  Spinner
} from '../../../ui';
import { 
  ArrowRight, 
  Check,
  Zap,
  Shield,
  Crown
} from 'lucide-react';
import type { StepProps } from './types';
import { getSubscriptionTiers, getTiersByPrivacy, tierToFormFeatures, mapBackendPlanToTier, type TierType, type SubscriptionTier, getDefaultSubscriptionTiers } from './subscriptionTiers';
import { formatCurrencyPHP } from '../../../../utils/formatter';
import type { SubscriptionStatus, AddOn } from '../../../../services/subscriptionService';
import { SubscriptionService, type SubscriptionPlan } from '../../../../services/subscriptionService';

interface SubscriptionTierStepProps extends StepProps {
  submitLoading?: boolean;
}

const getTierIcon = (tier: SubscriptionTier) => {
  switch (tier.type) {
    case 'free':
      return Shield;
    case 'basic':
      return Zap;
    case 'pro':
      return Zap;
    case 'enterprise':
      return Crown;
    default:
      return Shield;
  }
};

const getTierColor = (tier: SubscriptionTier) => {
  switch (tier.type) {
    case 'free':
      return 'teal';
    case 'basic':
      return 'blue';
    case 'pro':
      return 'purple';
    case 'enterprise':
      return 'amber';
    default:
      return 'slate';
  }
};

export const SubscriptionTierStep: React.FC<SubscriptionTierStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onBack,
  submitLoading = false
 }) => {
  const { t } = useTranslation();
  const [backendPlans, setBackendPlans] = useState<SubscriptionPlan[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchPlans();
    fetchAddOns();
  }, []);

  // Calculate total amount whenever plan, billing type, or add-ons change
  useEffect(() => {
    calculateTotalAmount();
  }, [formData.selectedTier, formData.billingType, formData.selectedAddOns]);

  const calculateTotalAmount = () => {
    let total = 0;
    
    // Add plan cost
    const selectedTierData = tiers.find(t => t.type === formData.selectedTier);
    if (selectedTierData) {
      if (formData.billingType === 'yearly' && selectedTierData.annualPrice) {
        total += selectedTierData.annualPrice;
      } else {
        total += selectedTierData.monthlyPrice;
      }
    }

    // Add add-ons cost
    if (formData.selectedAddOns.length > 0) {
      formData.selectedAddOns.forEach(addOnCode => {
        const addOn = addOns.find(a => a.code === addOnCode);
        if (addOn && formData.billingType === 'monthly') {
          total += addOn.monthlyPrice;
        } else if (addOn && formData.billingType === 'yearly') {
          // For yearly, multiply monthly price by 12 or use one-time price if available
          total += (addOn.oneTimePrice || addOn.monthlyPrice * 12);
        }
      });
    }

    setFormData({
      ...formData,
      totalAmount: total,
      paymentType: formData.billingType,
    });
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const plans = await SubscriptionService.getPlans();
      setBackendPlans(plans);
      
      const mappedTiers = plans
        .map((plan) => mapBackendPlanToTier(plan))
        .filter((tier): tier is SubscriptionTier => tier !== null);
      
      setTiers(mappedTiers);
    } catch (error) {
      const defaultTiers = getDefaultSubscriptionTiers();
      setTiers(defaultTiers);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddOns = async () => {
    try {
      const fetchedAddOns = await SubscriptionService.getAddOns();
      setAddOns(fetchedAddOns);
    } catch (error) {
      setAddOns([]);
    }
  };

  const availableTiers = tiers;

  const canProceed = formData.selectedTier !== null;

  const handleTierSelect = (tier: SubscriptionTier) => {
    const tierFeatures = tierToFormFeatures(tier);
    
    setFormData({
      ...formData,
      selectedTier: tier.type,
      planId: tier.id,
      ...tierFeatures,
    });
  };

  const handleAddOnToggle = (addOnCode: string) => {
    const isSelected = formData.selectedAddOns.includes(addOnCode);
    const updatedAddOns = isSelected
      ? formData.selectedAddOns.filter(code => code !== addOnCode)
      : [...formData.selectedAddOns, addOnCode];
    
    setFormData({
      ...formData,
      selectedAddOns: updatedAddOns,
    });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = isSelected ? 'ring-2 ring-offset-2' : 'hover:border-current';
    const colors: Record<string, { ring: string; border: string; bg: string; text: string; button: string }> = {
      teal: {
        ring: 'ring-teal-500 ring-offset-slate-50',
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        button: 'bg-teal-600 hover:bg-teal-700',
      },
      blue: {
        ring: 'ring-blue-500 ring-offset-slate-50',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        ring: 'ring-purple-500 ring-offset-slate-50',
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      amber: {
        ring: 'ring-amber-500 ring-offset-slate-50',
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700',
      },
    };
    return colors[color] || colors.slate;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-6 sm:px-8 py-6">
        <div className="space-y-6 pb-28 pr-4 max-w-4xl">
          {/* Billing Type Toggle */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-600">
              {t('community.selectPlan', 'Choose Your Subscription Plan')}
            </p>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg inline-flex">
              <button
                onClick={() => setFormData({...formData, billingType: 'monthly'})}
                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                  formData.billingType === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📅 Monthly
              </button>
              <button
                onClick={() => setFormData({...formData, billingType: 'yearly'})}
                className={`px-4 py-2 rounded-md font-bold text-sm transition-all relative ${
                  formData.billingType === 'yearly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📆 Yearly
                <span className="absolute -top-2 -right-1 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              All community types can choose any plan level. Select the plan that best fits your community's needs.
            </p>

            {availableTiers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">{t('community.noPlansAvailable', 'No plans available')}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {availableTiers.map((tier) => {
                  const isSelected = formData.selectedTier === tier.type;
                  const color = getTierColor(tier);
                  const colorClasses = getColorClasses(color, isSelected);
                  const Icon = getTierIcon(tier);
                  const yearlyPrice = tier.annualPrice || Math.round(tier.monthlyPrice * 12 * 0.8); // 20% discount for yearly

                  return (
                    <button
                      key={tier.code}
                      onClick={() => handleTierSelect(tier)}
                      className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected 
                          ? `${colorClasses.ring} ${colorClasses.border} ${colorClasses.bg}` 
                          : `border-slate-200 hover:border-slate-300 bg-white`
                      }`}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${colorClasses.button} text-white flex items-center justify-center`}>
                          <Check size={16} />
                        </div>
                      )}

                      {/* Badge */}
                      {tier.badge && (
                        <div className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold ${colorClasses.bg} ${colorClasses.text}`}>
                          {tier.badge}
                        </div>
                      )}

                      {/* Icon & Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
                          <Icon size={18} className={colorClasses.text} />
                        </div>
                        <h3 className={`font-black text-lg ${isSelected ? colorClasses.text : 'text-slate-800'}`}>
                          {tier.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                        {tier.description}
                      </p>

                      {/* Price */}
                      <div className="mb-4 pb-4 border-b border-slate-100">
                        <p className={`text-2xl font-black ${isSelected ? colorClasses.text : 'text-slate-900'}`}>
                          {tier.monthlyPrice === 0 ? t('community.free', 'Free') : (
                            formData.billingType === 'monthly' 
                              ? formatCurrencyPHP(tier.monthlyPrice)
                              : formatCurrencyPHP(yearlyPrice)
                          )}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {formData.billingType === 'yearly' ? 'per year' : 'per month'}
                        </p>
                      </div>

                      {/* Highlight Features */}
                      <ul className="space-y-2">
                        {tier.highlightFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <Check size={14} className={`${colorClasses.text} shrink-0 mt-0.5`} />
                            <span className={isSelected ? colorClasses.text : 'text-slate-600'}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Instant Approval Badge for Enterprise */}
                      {tier.instantApproval && (
                        <div className={`mt-4 pt-4 border-t ${colorClasses.bg} rounded-lg p-2 text-center`}>
                          <p className={`text-[10px] font-black uppercase tracking-wider ${colorClasses.text}`}>
                            ⚡ {t('community.instantApproval', 'Instant Approval')}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add-ons Section */}
          {addOns.length > 0 && (
            <div className="space-y-3 mt-8 pt-8 border-t border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 mb-1">🎁 Optional Add-ons</h3>
                <p className="text-xs text-slate-500">
                  Enhance your community with additional features. Add-ons are billed {formData.billingType === 'monthly' ? 'monthly' : 'annually'}.
                </p>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {addOns.map((addOn) => (
                  <button
                    key={addOn.code}
                    onClick={() => handleAddOnToggle(addOn.code)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.selectedAddOns.includes(addOn.code)
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.selectedAddOns.includes(addOn.code)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-slate-300'
                      }`}>
                        {formData.selectedAddOns.includes(addOn.code) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-bold text-sm text-slate-900">{addOn.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{addOn.description}</p>
                        <p className="font-black text-purple-600 text-sm mt-2">
                          {formData.billingType === 'monthly' 
                            ? formatCurrencyPHP(addOn.monthlyPrice)
                            : formatCurrencyPHP(addOn.oneTimePrice || addOn.monthlyPrice * 12)
                          }
                          <span className="text-slate-500 text-xs ml-1">
                            {formData.billingType === 'yearly' ? '/year' : '/month'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Total Summary */}
          {formData.selectedTier && (
            <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Total Cost:</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrencyPHP(formData.totalAmount)}
                  <span className="text-xs font-medium text-slate-500 ml-2">
                    {formData.billingType === 'yearly' ? '/year' : '/month'}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold">📋 </span>
              All community types can select any subscription level. Upgrade, downgrade, or modify add-ons anytime.
            </p>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50 relative z-20 sticky bottom-0 flex-shrink-0">
        <Button type="button" variant="ghost" onClick={onBack} className="font-bold text-slate-600 hover:bg-slate-100" disabled={submitLoading}>
          {t('common.back')}
        </Button>
        <Button 
          type="button" 
          onClick={onNext} 
          disabled={!canProceed || submitLoading}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black px-6 sm:px-8 h-11 rounded-lg shadow-lg shadow-teal-100 flex items-center gap-2"
        >
          {submitLoading ? <Spinner size="sm" /> : null}
          {t('common.continue')} <ArrowRight size={18} />
        </Button>
      </DialogFooter>
    </div>
  );
};
