import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Spinner,
  Switch
} from '../../ui';
import { Modal } from '../../ui/Modal/Modal';
import { Settings, Upload, Save, X, Plus, Trash2, MapPin } from 'lucide-react';
import type { Community } from '@/types/community';
import { CommunityService } from '@/services';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '@/utils/geolocation';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  onSuccess?: () => void;
}

export const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({ isOpen, onClose, community, onSuccess }) => {
  const { t } = useTranslation();
  const FEATURES = [
    { id: 'hasLiveChat', label: t('community.features.live_chat'), description: t('community.features.live_chat_desc') },
    { id: 'hasFeedUpdates', label: t('community.features.feed'), description: t('community.features.feed_desc') },
    { id: 'hasNewsPosts', label: t('community.features.news'), description: t('community.features.news_desc') },
    { id: 'hasAnnouncements', label: t('community.features.announcements'), description: t('community.features.announcements_desc') },
    { id: 'hasDiscussionPosts', label: t('community.features.discussion'), description: t('community.features.discussion_desc') },
    { id: 'hasIncidentReporting', label: t('community.features.incidents'), description: t('community.features.incidents_desc') },
    { id: 'hasEmergencyMap', label: t('community.features.emergency_map'), description: t('community.features.emergency_map_desc') },
    { id: 'hasBroadcastAlerts', label: t('community.features.broadcast'), description: t('community.features.broadcast_desc') },
    { id: 'hasMemberDirectory', label: t('community.features.directory'), description: t('community.features.directory_desc') },
    { id: 'hasSkillMatching', label: t('community.features.skill_matching'), description: t('community.features.skill_matching_desc') },
    { id: 'hasEquipmentSharing', label: t('community.features.equipment'), description: t('community.features.equipment_desc') },
    { id: 'hasNeedsBoard', label: t('community.features.needs'), description: t('community.features.needs_desc') },
    { id: 'hasTradeMarket', label: t('community.features.trade'), description: t('community.features.trade_desc') },
    { id: 'hasEvents', label: t('community.features.events'), description: t('community.features.events_desc') },
  ];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: community.name || '',
    tagline: community.tagline || '',
    description: community.description || '',
    location: community.location || '',
    rules: Array.isArray(community.rules) ? [...community.rules] : [] as string[],
    // Feature Flags
    hasLiveChat: community.hasLiveChat || false,
    hasFeedUpdates: community.hasFeedUpdates || false,
    hasNewsPosts: community.hasNewsPosts || false,
    hasAnnouncements: community.hasAnnouncements || false,
    hasDiscussionPosts: community.hasDiscussionPosts || false,
    hasIncidentReporting: community.hasIncidentReporting || false,
    hasEmergencyMap: community.hasEmergencyMap || false,
    hasBroadcastAlerts: community.hasBroadcastAlerts || false,
    hasMemberDirectory: community.hasMemberDirectory || false,
    hasSkillMatching: community.hasSkillMatching || false,
    hasEquipmentSharing: community.hasEquipmentSharing || false,
    hasNeedsBoard: community.hasNeedsBoard || false,
    hasTradeMarket: community.hasTradeMarket || false,
    hasEvents: community.hasEvents || false,
  });

  const [newRule, setNewRule] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || '',
        tagline: community.tagline || '',
        description: community.description || '',
        location: community.location || '',
        rules: Array.isArray(community.rules) ? [...community.rules] : [],
        // Feature Flags
        hasLiveChat: community.hasLiveChat || false,
        hasFeedUpdates: community.hasFeedUpdates || false,
        hasNewsPosts: community.hasNewsPosts || false,
        hasAnnouncements: community.hasAnnouncements || false,
        hasDiscussionPosts: community.hasDiscussionPosts || false,
        hasIncidentReporting: community.hasIncidentReporting || false,
        hasEmergencyMap: community.hasEmergencyMap || false,
        hasBroadcastAlerts: community.hasBroadcastAlerts || false,
        hasMemberDirectory: community.hasMemberDirectory || false,
        hasSkillMatching: community.hasSkillMatching || false,
        hasEquipmentSharing: community.hasEquipmentSharing || false,
        hasNeedsBoard: community.hasNeedsBoard || false,
        hasTradeMarket: community.hasTradeMarket || false,
        hasEvents: community.hasEvents || false,
      });
    }
  }, [community]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length >= 3 && isSearchingLocation) {
        try {
          const results = await searchLocations(formData.location);
          setLocationSuggestions(results || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch locations:', error);
          setLocationSuggestions([]);
        } finally {
          setIsSearchingLocation(false);
        }
      } else if (formData.location.length < 3) {
        setShowSuggestions(false);
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location, isSearchingLocation]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await CommunityService.updateCommunity(community.id.toString(), formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      className="p-0 border-none rounded-[2.5rem] bg-white"
    >
      <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto">
        <div>
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Settings className="text-teal-600" size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t('community.settings_title')}</h2>
          <p className="text-slate-500 font-medium">
            {t('community.settings_subtitle')}
          </p>
        </div>

        <div className="py-2 space-y-8">
          {/* Visual Identity */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.visual_identity')}</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                      <Upload className="text-slate-400" size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">{t('community.change_logo')}</p>
                   <p className="text-[10px] text-slate-400 mt-1">{t('community.logo_requirements')}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                      <Upload className="text-slate-400" size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">{t('community.change_banner')}</p>
                   <p className="text-[10px] text-slate-400 mt-1">{t('community.banner_requirements')}</p>
                </div>
             </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.name')}</label>
                <input 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.tagline')}</label>
                <input 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                  placeholder={t('community.tagline_placeholder')}
                  value={formData.tagline}
                  onChange={e => setFormData({...formData, tagline: e.target.value})}
                />
             </div>
             <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.address_location')}</label>
                <div className="relative">
                  <input 
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                    placeholder={t('community.location_placeholder')}
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({...formData, location: e.target.value});
                      setIsSearchingLocation(true);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                    }}
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-[301] w-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion) => (
                        <div
                          key={`${suggestion.lat}-${suggestion.lon}`}
                          role="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-2 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectLocation(suggestion);
                          }}
                        >
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                          <span>{suggestion.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.description')}</label>
                <textarea 
                  className="w-full p-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700 resize-none" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
             </div>
          </div>

          {/* Feature Subscription */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.features_title')}</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURES.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-700">{feature.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{feature.description}</p>
                    </div>
                    <Switch 
                      checked={(formData as any)[feature.id]} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [feature.id]: checked }))}
                    />
                  </div>
                ))}
             </div>
          </div>

          {/* Rules Management */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.rules_title')}</label>
             <div className="space-y-3">
                {formData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group">
                     <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">{idx + 1}</div>
                     <span className="flex-1 text-sm font-medium text-slate-700">{rule}</span>
                     <button onClick={() => removeRule(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
             </div>
             <div className="flex gap-2">
                <input 
                  className="flex-1 h-12 px-4 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-teal-500 font-medium text-slate-700" 
                  placeholder={t('community.add_rule_placeholder')}
                  value={newRule}
                  onChange={e => setNewRule(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addRule()}
                />
                <Button onClick={addRule} variant="ghost" className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100">
                   <Plus size={20} />
                </Button>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
           <Button variant="ghost" onClick={onClose} className="font-bold text-slate-400 rounded-xl h-12 px-6">
              {t('community.discard_changes')}
           </Button>
           <Button 
             onClick={handleSave} 
             disabled={loading}
             className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl h-12 px-10 shadow-xl shadow-teal-100 transition-all active:scale-95"
           >
              {loading ? <Spinner size="sm" className="mr-2" /> : <Save size={18} className="mr-2" />}
              {t('community.save_settings')}
           </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CommunitySettingsModal;
