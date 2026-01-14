import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ScrollArea, 
  DialogFooter, 
  Button,
  Switch
} from '../../../ui';
import { 
  ArrowRight, 
  HeartHandshake, 
  ShoppingBag, 
  CalendarDays 
} from 'lucide-react';
import type { StepProps } from './types';
import { FeatureToggle } from './components/FeatureToggle';
import { CategorySection } from './components/CategorySection';

export const FeaturesStep: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack, subStatus }) => {
  const { t } = useTranslation();

  const getSectionTitles = (privacy: string) => {
    switch (privacy) {
      case 'school':
        return {
          social: 'Campus Engagement',
          economy: 'Student Services & Trade',
          safety: 'Campus Safety & Response'
        };
      case 'lgu':
        return {
          social: 'Civilian Engagement',
          economy: 'Public Resources',
          safety: 'Emergency Operations'
        };
      case 'event':
        return {
          social: 'Event Communication',
          economy: 'Equipment & Logistics',
          safety: 'Incident Response'
        };
      case 'organization':
        return {
          social: 'Member Engagement',
          economy: 'Resource Inventory',
          safety: 'Field Safety'
        };
      default:
        return {
          social: 'Engagement & Social',
          economy: 'Support & Economy',
          safety: 'Safety & Response'
        };
    }
  };

  const titles = getSectionTitles(formData.privacy);
  const isSponsered = formData.privacy === 'barangay';

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="space-y-6 pb-4">
          <CategorySection title={titles.social}>
            <FeatureToggle 
              label="Live Chat"
              description="Real-time messaging channels"
              checked={formData.hasLiveChat}
              onCheckedChange={(v) => setFormData({...formData, hasLiveChat: v})}
              price={isSponsered ? 0 : 250}
            />

            <FeatureToggle 
              label="Events & Planning"
              description="Calendar & community meetups"
              checked={formData.hasEvents}
              onCheckedChange={(v) => setFormData({...formData, hasEvents: v})}
              icon={CalendarDays}
              iconColor="text-amber-500"
              price={isSponsered ? 0 : 100}
            />

            <div className="border-t border-slate-100 pt-3">
              <FeatureToggle 
                label="Activity Feed"
                description="Updates, News & Discussions"
                checked={formData.hasFeedUpdates}
                onCheckedChange={(v) => setFormData({
                  ...formData, 
                  hasFeedUpdates: v,
                  hasNewsPosts: v ? formData.hasNewsPosts : false,
                  hasAnnouncements: v ? formData.hasAnnouncements : false,
                  hasDiscussionPosts: v ? formData.hasDiscussionPosts : false
                })}
                price={isSponsered ? 0 : 150}
              />

              {formData.hasFeedUpdates && (
                <div className="ml-4 mt-3 space-y-3 border-l-2 border-slate-100 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-600">News Posts</p>
                    <Switch 
                      checked={formData.hasNewsPosts}
                      onCheckedChange={(v) => setFormData({...formData, hasNewsPosts: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-600">Announcements</p>
                    <Switch 
                      checked={formData.hasAnnouncements}
                      onCheckedChange={(v) => setFormData({...formData, hasAnnouncements: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-600">Discussions</p>
                    <Switch 
                      checked={formData.hasDiscussionPosts}
                      onCheckedChange={(v) => setFormData({...formData, hasDiscussionPosts: v})}
                    />
                  </div>
                </div>
              )}
            </div>
          </CategorySection>

          <CategorySection title={titles.economy}>
            <FeatureToggle 
              label="Needs Board"
              description="Request help or donate items"
              checked={formData.hasNeedsBoard}
              onCheckedChange={(v) => setFormData({...formData, hasNeedsBoard: v})}
              icon={HeartHandshake}
              iconColor="text-indigo-500"
              price={isSponsered ? 0 : 200}
            />
            <FeatureToggle 
              label="Trade Market"
              description="Buy, sell, or swap within community"
              checked={formData.hasTradeMarket}
              onCheckedChange={(v) => setFormData({...formData, hasTradeMarket: v})}
              icon={ShoppingBag}
              iconColor="text-emerald-500"
              price={isSponsered ? 0 : 300}
            />
          </CategorySection>

          <CategorySection title={titles.safety}>
            <FeatureToggle 
              label="Incident Management"
              description="Emergency reporting systems"
              checked={formData.hasIncidentReporting}
              onCheckedChange={(v) => setFormData({
                ...formData, 
                hasIncidentReporting: v,
                hasEmergencyMap: v ? formData.hasEmergencyMap : false,
                hasBroadcastAlerts: v ? formData.hasBroadcastAlerts : false
              })}
              price={isSponsered ? 0 : 500}
            />

            {formData.hasIncidentReporting && (
              <div className="ml-4 mt-3 space-y-3 border-l-2 border-slate-100 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-600">Emergency Map</p>
                  <Switch 
                    checked={formData.hasEmergencyMap}
                    onCheckedChange={(v) => setFormData({...formData, hasEmergencyMap: v})}
                  />
                </div>
                <FeatureToggle 
                  label="Broadcast Alerts"
                  description="Immediate community notifications"
                  checked={formData.hasBroadcastAlerts}
                  onCheckedChange={(v) => setFormData({...formData, hasBroadcastAlerts: v})}
                  disabled={subStatus && !subStatus.isPremium}
                  premium={subStatus && !subStatus.isPremium}
                  price={isSponsered ? 0 : 1000}
                />
              </div>
            )}
          </CategorySection>

          <CategorySection title="Members & Resources">
            <FeatureToggle 
              label="Member Directory"
              description="List of volunteers & specialists"
              checked={formData.hasMemberDirectory}
              onCheckedChange={(v) => setFormData({
                ...formData, 
                hasMemberDirectory: v,
                hasSkillMatching: v ? formData.hasSkillMatching : false,
                hasEquipmentSharing: v ? formData.hasEquipmentSharing : false
              })}
              price={isSponsered ? 0 : 150}
            />

            {formData.hasMemberDirectory && (
              <div className="ml-4 mt-3 space-y-3 border-l-2 border-slate-100 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-600">Skill Matching</p>
                  <Switch 
                    checked={formData.hasSkillMatching}
                    onCheckedChange={(v) => setFormData({...formData, hasSkillMatching: v})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-600">Equipment Sharing</p>
                  <Switch 
                    checked={formData.hasEquipmentSharing}
                    onCheckedChange={(v) => setFormData({...formData, hasEquipmentSharing: v})}
                  />
                </div>
              </div>
            )}
          </CategorySection>
        </div>
      </ScrollArea>

      <DialogFooter className="p-6 border-t border-slate-50 flex items-center justify-between gap-3 bg-white relative z-10">
        <Button type="button" variant="ghost" onClick={onBack} className="font-bold text-slate-500">
          Back
        </Button>
        <Button 
            type="button" 
            onClick={onNext} 
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100"
        >
          {t('common.continue')} <ArrowRight size={18} className="ml-2" />
        </Button>
      </DialogFooter>
    </div>
  );
};
