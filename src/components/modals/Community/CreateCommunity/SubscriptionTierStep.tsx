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
import { SUBSCRIPTION_TIERS, getTiersByPrivacy, tierToFormFeatures, mapBackendPlanToTier, type TierType, type SubscriptionTier } from './subscriptionTiers';
import { formatCurrencyPHP } from '../../../../utils/formatter';
import type { SubscriptionStatus } from '../../../../services/subscriptionService';
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
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // Always fetch all available plans from backend, regardless of privacy setting
    // This allows all community types (including barangays) to choose any subscription
    setLoading(true);
    try {
      console.log('Fetching all available plans from backend');
      const plans = await SubscriptionService.getPlans();
      console.log('Received plans from backend:', plans);
      console.log('Number of plans received:', plans.length);
      setBackendPlans(plans);
      
      // Map all backend plans to tiers
      const mappedTiers = plans
        .map((plan, idx) => {
          console.log(`Mapping plan ${idx}:`, plan);
          return mapBackendPlanToTier(plan);
        })
        .filter((tier): tier is SubscriptionTier => {
          const isValid = tier !== null;
          console.log(`Filter result for tier:`, isValid ? tier : 'null');
          return isValid;
        });
      
      console.log('Mapped tiers length:', mappedTiers.length);
      console.log('Mapped tiers:', mappedTiers);
      setTiers(mappedTiers);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      // Fallback to static tiers - show all plans to all community types
      const allTierTypes: TierType[] = ['basic', 'pro', 'enterprise'];
      console.log('Using fallback tiers:', allTierTypes);
      setTiers(allTierTypes.map(type => SUBSCRIPTION_TIERS[type]));
    } finally {
      setLoading(false);
    }
  };

  const availableTiers = tiers;

  const canProceed = formData.selectedTier !== null;

  const handleTierSelect = (tier: SubscriptionTier) => {
    const tierFeatures = tierToFormFeatures(tier);
    
    setFormData({
      ...formData,
      selectedTier: tier.type,
      ...tierFeatures,
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
    console.log('Component in loading state');
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  console.log('Rendering with availableTiers:', availableTiers);
  console.log('Number of available tiers:', availableTiers.length);

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="space-y-6 pb-4">
          <div>
            <p className="text-sm font-bold text-slate-600 mb-2">
              {t('community.selectPlan', 'Choose Your Subscription Plan')}
            </p>
            <p className="text-xs text-slate-500">
              {t('community.selectPlanDesc', 'All community types can choose any plan level. Select the plan that best fits your community\'s needs and features.')}
            </p>
          </div>

          {availableTiers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">{t('community.noPlansAvailable', 'No plans available')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {availableTiers.map((tier, idx) => {
                console.log(`Rendering tier ${idx}:`, tier);
                const isSelected = formData.selectedTier === tier.type;
                const color = getTierColor(tier);
                const colorClasses = getColorClasses(color, isSelected);
                const Icon = getTierIcon(tier);

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
                        {tier.monthlyPrice === 0 ? t('community.free', 'Free') : formatCurrencyPHP(tier.monthlyPrice)}
                      </p>
                      {tier.monthlyPrice > 0 && (
                        <p className="text-xs text-slate-400 font-medium">per month</p>
                      )}
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

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold">📋 </span>
              {t('community.tierInfo', 'Choose a plan that fits your community needs. All community types can select any subscription level. Upgrade or downgrade anytime. Enterprise plans include instant approval.')}
            </p>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="p-6 border-t border-slate-50 flex items-center justify-between gap-3 bg-white relative z-10 sticky bottom-0 mb-4">
        <Button type="button" variant="ghost" onClick={onBack} className="font-bold text-slate-500" disabled={submitLoading}>
          {t('common.back')}
        </Button>
        <Button 
          type="button" 
          onClick={onNext} 
          disabled={!canProceed || submitLoading}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100 flex items-center gap-2"
        >
          {submitLoading ? <Spinner size="sm" /> : null}
          {t('common.continue')} <ArrowRight size={18} />
        </Button>
      </DialogFooter>
    </div>
  );
};
