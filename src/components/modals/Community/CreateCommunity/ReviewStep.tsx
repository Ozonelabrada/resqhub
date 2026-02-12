import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ScrollArea, 
  Button,
  Spinner
} from '../../../ui';
import { 
  Lock, 
  AlertCircle, 
  Users,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Building2,
  MapPin,
  Landmark,
  Check,
  Zap,
  Shield,
  Crown
} from 'lucide-react';
import { formatCurrencyPHP } from '../../../../utils/formatter';
import type { StepProps, CommunityFormData } from './types';
import type { SubscriptionStatus } from '../../../../services/subscriptionService';
import { SUBSCRIPTION_TIERS } from './subscriptionTiers';

interface ReviewStepProps extends StepProps {
  loading: boolean;
  onFinalSubmit: () => void;
}

const getTierIcon = (tierType: string | null) => {
  switch (tierType) {
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

const getTierColor = (tierType: string | null) => {
  switch (tierType) {
    case 'free':
      return { bg: 'bg-teal-50', text: 'text-teal-700', hex: '#14b8a6' };
    case 'basic':
      return { bg: 'bg-blue-50', text: 'text-blue-700', hex: '#3b82f6' };
    case 'pro':
      return { bg: 'bg-purple-50', text: 'text-purple-700', hex: '#a855f7' };
    case 'enterprise':
      return { bg: 'bg-amber-50', text: 'text-amber-700', hex: '#f59e0b' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', hex: '#64748b' };
  }
};

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  formData, 
  onBack, 
  loading, 
  onFinalSubmit 
}) => {
  const { t } = useTranslation();
  
  const selectedTier = formData.selectedTier ? SUBSCRIPTION_TIERS[formData.selectedTier] : null;
  const tierColor = getTierColor(formData.selectedTier);
  const TierIcon = getTierIcon(formData.selectedTier);

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="space-y-8 pb-4 max-w-2xl">
          {/* Community Overview */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('community.create.review.overview')}</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">{t('community.name')}</p>
                <p className="font-black text-slate-800">{formData.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">{t('community.privacy')}</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    {formData.privacy === 'barangay' && <ShieldAlert size={14} className="text-teal-600" />}
                    {formData.privacy === 'city' && <MapPin size={14} className="text-teal-600" />}
                    {formData.privacy === 'lgu' && <Landmark size={14} className="text-teal-600" />}
                    {formData.privacy === 'school' && <GraduationCap size={14} className="text-teal-600" />}
                    {formData.privacy === 'organization' && <Building2 size={14} className="text-teal-600" />}
                    {formData.privacy === 'event' && <Calendar size={14} className="text-teal-600" />}
                    {formData.privacy === 'private' && <Lock size={14} className="text-teal-600" />}
                    <span>
                      {formData.privacy === 'lgu' ? t('community.create.types.lgu') : 
                      formData.privacy === 'school' ? t('community.create.types.school') :
                      formData.privacy === 'event' ? t('community.create.types.event') :
                      t(`community.create.types.${formData.privacy}`)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('community.location')}</p>
                  <p className="font-black text-slate-900 text-sm">{formData.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Tier Details */}
          {selectedTier && (
            <div className={`${tierColor.bg} rounded-3xl p-6 border-2 ${tierColor.text} border-current relative overflow-hidden`}>
              <div className="absolute top-0 right-0 opacity-5 p-8">
                <TierIcon size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${tierColor.bg} flex items-center justify-center`}>
                    <TierIcon size={20} className={tierColor.text} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-current/60 uppercase tracking-widest">{t('community.selectedPlan', 'Selected Plan')}</p>
                    <h3 className={`font-black text-2xl ${tierColor.text}`}>{selectedTier.name}</h3>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-current/10">
                  <p className="text-sm font-medium text-current/70 mb-3">{selectedTier.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${tierColor.text}`}>
                      {selectedTier.monthlyPrice === 0 ? t('community.free', 'Free') : formatCurrencyPHP(selectedTier.monthlyPrice)}
                    </span>
                    {selectedTier.monthlyPrice > 0 && (
                      <span className="text-sm font-bold text-current/60">{t('community.perMonth', 'per month')}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className={`text-[10px] font-black ${tierColor.text} uppercase tracking-widest mb-3`}>Included Features</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTier.highlightFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-bold">
                        <Check size={16} className={tierColor.text} />
                        <span className={tierColor.text}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instant Approval Badge */}
                {selectedTier.instantApproval && (
                  <div className={`mt-6 p-3 rounded-lg ${tierColor.bg} border border-current flex items-center gap-2`}>
                    <Zap size={16} className={tierColor.text} />
                    <p className={`text-xs font-black ${tierColor.text} uppercase`}>⚡ {t('community.instantApproval', 'Instant Approval')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Notice */}
          {selectedTier && !selectedTier.instantApproval && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="text-sm">
                <p className="font-black text-amber-900">{t('community.create.review.verification_required')}</p>
                <p className="text-amber-700 font-medium leading-relaxed">
                  {t('community.create.review.manual_approval_desc')}
                </p>
              </div>
            </div>
          )}

          {/* Capacity Info */}
          <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="text-sm">
              <p className="font-black text-blue-900">{t('community.capacity')}</p>
              <p className="text-blue-700 font-medium">
                {formData.maxMembers >= 10000 ? t('community.unlimitedMembers', 'Unlimited members') : `Up to ${formData.maxMembers.toLocaleString()} members`}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-slate-50 flex items-center justify-between gap-4 bg-white relative z-10 sticky bottom-0 mb-4">
        <Button variant="ghost" onClick={onBack} className="font-bold text-slate-500" disabled={loading}>
          {t('common.back')}
        </Button>
        <Button 
          onClick={onFinalSubmit} 
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black h-12 rounded-xl shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
        >
          {loading && <Spinner size="sm" />}
          {loading ? t('common.loading') : selectedTier?.instantApproval ? t('community.create.now', 'Create Now') : t('community.create.review.submit_review')}
        </Button>
      </div>
    </div>
  );
};
