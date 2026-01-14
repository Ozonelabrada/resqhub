import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ScrollArea, 
  Button 
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
  Landmark
} from 'lucide-react';
import { formatCurrencyPHP } from '../../../../utils/formatter';
import type { StepProps, CommunityFormData } from './types';
import type { SubscriptionStatus } from '../../../../services/subscriptionService';

interface ReviewStepProps extends StepProps {
  loading: boolean;
  onFinalSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  formData, 
  onBack, 
  subStatus, 
  loading, 
  onFinalSubmit 
}) => {
  const { t } = useTranslation();
  const calculateTotal = (data: CommunityFormData, status?: SubscriptionStatus) => {
    // If it's a barangay, it's sponsored (0 PHP)
    if (data.privacy === 'barangay') return 0;

    let total = 0;

    // Base Price by Privacy/Type
    const basePrices: Record<string, number> = {
      private: 499,
      event: 299,
      school: 999,
      organization: 749,
      lgu: 2499,
      city: 1999
    };
    
    total += basePrices[data.privacy] || 499;

    // Capacity Pricing
    const capacityPrices: Record<number, number> = {
      100: 0,
      500: 500,
      1000: 1000,
      5000: 2500,
      10000: 5000
    };
    total += capacityPrices[data.maxMembers] || 0;

    // Engagement Features
    if (data.hasLiveChat) total += 250;
    if (data.hasEvents) total += 100;
    if (data.hasFeedUpdates) {
      total += 150;
      // Detailed feed options are usually bundled but could have small increments
      if (data.hasNewsPosts) total += 50;
      if (data.hasAnnouncements) total += 50;
    }

    // Safety & Response (Higher tier because of server resources)
    if (data.hasIncidentReporting) {
      total += 500;
      if (data.hasEmergencyMap) total += 300;
      if (data.hasBroadcastAlerts) total += 1000; // SMS/Push costs
    }

    // Social Economy
    if (data.hasNeedsBoard) total += 200;
    if (data.hasTradeMarket) total += 300;

    // Resource Management
    if (data.hasMemberDirectory) {
      total += 150;
      if (data.hasSkillMatching) total += 150;
      if (data.hasEquipmentSharing) total += 250;
    }

    // Premium Discount
    if (status?.isPremium) {
      total = Math.max(0, total - 750);
    }

    return total;
  };

  const totalValue = calculateTotal(formData, subStatus);

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="space-y-8">
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('community.create.review.base_price')}</p>
                      <p className="font-black text-slate-900 text-sm">
                        {formData.privacy === 'barangay' ? t('community.create.review.free') : formatCurrencyPHP(
                          formData.privacy === 'lgu' ? 2499 : 
                          formData.privacy === 'city' ? 1999 : 
                          formData.privacy === 'school' ? 999 : 
                          formData.privacy === 'organization' ? 749 : 499
                        )}
                      </p>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                   <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">{t('community.create.review.capacity')}</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Users size={14} className="text-teal-600" />
                        <span>{formData.maxMembers >= 10000 ? t('community.create.review.unlimited') : t('community.create.review.members_count', { count: formData.maxMembers })}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('community.create.review.quota_fee')}</p>
                      <p className="font-black text-slate-900 text-sm">
                        {formData.privacy === 'barangay' ? t('community.create.review.free') : (
                          formData.maxMembers === 100 ? t('community.create.review.included') : formatCurrencyPHP(
                            formData.maxMembers === 500 ? 500 : 
                            formData.maxMembers === 1000 ? 1000 : 
                            formData.maxMembers === 5000 ? 2500 : 5000
                          )
                        )}
                      </p>
                   </div>
                </div>

                <div>
                   <p className="text-xs font-bold text-slate-400 mb-2">{t('community.create.review.enabled_features')}</p>
                   <div className="flex flex-wrap gap-2">
                      {formData.hasLiveChat && <FeatureBadge label={t('community.create.features.live_chat_title')} color="teal" />}
                      {formData.hasEvents && <FeatureBadge label={t('community.create.features.events_title')} color="amber" />}
                      {formData.hasFeedUpdates && <FeatureBadge label={t('community.create.features.feed_title')} color="blue" />}
                      {formData.hasNeedsBoard && <FeatureBadge label={t('community.create.features.needs_title')} color="indigo" />}
                      {formData.hasTradeMarket && <FeatureBadge label={t('community.create.features.trade_title')} color="emerald" />}
                      {formData.hasIncidentReporting && <FeatureBadge label={t('community.create.features.incidents_title')} color="red" />}
                      {formData.hasEmergencyMap && <FeatureBadge label={t('community.create.features.emergency_map')} color="red" />}
                      {formData.hasBroadcastAlerts && <FeatureBadge label={t('community.create.features.broadcast_title')} color="orange" />}
                      {formData.hasMemberDirectory && <FeatureBadge label={t('community.create.features.member_directory_title')} color="purple" />}
                      {formData.hasSkillMatching && <FeatureBadge label={t('community.create.features.skill_matching')} color="purple" />}
                      {formData.hasEquipmentSharing && <FeatureBadge label={t('community.create.features.equipment_sharing')} color="purple" />}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users size={80} />
             </div>
             <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('community.create.review.est_monthly')}</h4>
                <div className="flex items-baseline gap-2 mb-1">
                   <span className="text-4xl font-black">{totalValue === 0 ? t('community.create.review.free') : formatCurrencyPHP(totalValue)}</span>
                   {totalValue > 0 && <span className="text-slate-400 font-bold text-sm">{t('community.create.review.per_month')}</span>}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{t('community.create.review.maintenance_desc')}</p>
                
                <div className="mt-6 space-y-3">
                   <div className="flex items-center justify-between text-[11px] font-bold border-t border-white/10 pt-3">
                      <span className="text-slate-400 font-medium tracking-wide uppercase">{t('community.create.review.setup_deployment')}</span>
                      <span className="text-teal-400 tracking-widest uppercase">{t('community.create.review.waived')}</span>
                   </div>
                   {subStatus?.isPremium && (
                      <div className="flex items-center justify-between text-[11px] font-bold bg-white/5 p-2 rounded-lg border border-white/10">
                        <span className="text-emerald-400 font-medium">{t('community.create.review.premium_perk')}</span>
                        <span className="text-emerald-400">- {formatCurrencyPHP(750)} / mo</span>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {totalValue === 0 ? (
            <div className="p-5 rounded-3xl bg-teal-50 border border-teal-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                 <ShieldAlert className="text-teal-600" size={20} />
              </div>
              <div className="text-sm">
                 <p className="font-black text-teal-900">{t('community.create.review.support_program')}</p>
                 <p className="text-teal-700 font-medium leading-relaxed">
                    {t('community.create.review.sponsored_desc')}
                 </p>
              </div>
            </div>
          ) : !subStatus?.isPremium && (
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
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-slate-50 flex items-center justify-between gap-4 bg-white relative z-10">
         <Button variant="ghost" onClick={onBack} className="font-bold text-slate-500">
            {t('common.back')}
         </Button>
         <Button 
            onClick={onFinalSubmit} 
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl shadow-lg shadow-teal-100"
         >
            {loading ? t('common.loading') : subStatus?.isPremium ? t('community.create.title') : t('community.create.review.submit_review')}
         </Button>
      </div>
    </div>
  );
};

const FeatureBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const colorClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${colorClasses[color]}`}>
      {label}
    </span>
  );
};
