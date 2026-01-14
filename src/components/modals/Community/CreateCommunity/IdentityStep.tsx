import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Input, 
  Textarea, 
  ScrollArea, 
  DialogFooter, 
  Button,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui';
import { Lock, ShieldAlert, ArrowRight, GraduationCap, Calendar, Building2, MapPin, Landmark, Loader2, Users } from 'lucide-react';
import type { StepProps } from './types';
import { searchLocations, type LocationSuggestion } from '../../../../utils/geolocation';
import { formatCurrencyPHP } from '../../../../utils/formatter';

export const IdentityStep: React.FC<StepProps> = ({ formData, setFormData, onNext, onClose }) => {
  const { t } = useTranslation();
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const isFormValid = formData.name && formData.description && formData.location;

  const getPrivacyLabels = (privacy: string) => {
    switch (privacy) {
      case 'school':
        return {
          name: t('community.create.labels.school_name'),
          namePlaceholder: t('community.create.labels.school_placeholder'),
          location: t('community.create.labels.school_location'),
          locationPlaceholder: t('community.create.labels.school_location_placeholder'),
          description: t('community.create.labels.school_description'),
          descPlaceholder: t('community.create.labels.school_desc_placeholder')
        };
      case 'lgu':
        return {
          name: t('community.create.labels.lgu_name'),
          namePlaceholder: t('community.create.labels.lgu_placeholder'),
          location: t('community.create.labels.lgu_location'),
          locationPlaceholder: t('community.create.labels.lgu_location_placeholder'),
          description: t('community.create.labels.lgu_description'),
          descPlaceholder: t('community.create.labels.lgu_desc_placeholder')
        };
      case 'barangay':
        return {
          name: t('community.create.labels.barangay_name'),
          namePlaceholder: t('community.create.labels.barangay_placeholder'),
          location: t('community.create.labels.barangay_location'),
          locationPlaceholder: t('community.create.labels.barangay_location_placeholder'),
          description: t('community.create.labels.barangay_description'),
          descPlaceholder: t('community.create.labels.barangay_desc_placeholder')
        };
      case 'event':
        return {
          name: t('community.create.labels.event_name'),
          namePlaceholder: t('community.create.labels.event_placeholder'),
          location: t('community.create.labels.event_location'),
          locationPlaceholder: t('community.create.labels.event_location_placeholder'),
          description: t('community.create.labels.event_description'),
          descPlaceholder: t('community.create.labels.event_desc_placeholder')
        };
      case 'organization':
        return {
          name: t('community.create.labels.org_name'),
          namePlaceholder: t('community.create.labels.org_placeholder'),
          location: t('community.create.labels.org_location'),
          locationPlaceholder: t('community.create.labels.org_location_placeholder'),
          description: t('community.create.labels.org_description'),
          descPlaceholder: t('community.create.labels.org_desc_placeholder')
        };
      case 'city':
        return {
          name: t('community.create.labels.city_name'),
          namePlaceholder: t('community.create.labels.city_placeholder'),
          location: t('community.create.labels.location'),
          locationPlaceholder: t('community.create.labels.location_placeholder'),
          description: t('community.create.labels.city_description'),
          descPlaceholder: t('community.create.labels.city_desc_placeholder')
        };
      default:
        return {
          name: t('community.create.labels.name'),
          namePlaceholder: t('community.create.labels.name_placeholder'),
          location: t('community.create.labels.location'),
          locationPlaceholder: t('community.create.labels.location_placeholder'),
          description: t('community.create.labels.description'),
          descPlaceholder: t('community.create.labels.description_placeholder')
        };
    }
  };

  const labels = getPrivacyLabels(formData.privacy);

  return (
    <form className="flex flex-col h-full max-h-[80vh]">
      <ScrollArea className="flex-1 px-8 py-6">
        <div className="space-y-6 pb-24">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{t('community.create.type_privacy')}</label>
            <Select value={formData.privacy} onValueChange={(v: any) => setFormData({...formData, privacy: v})}>
              <SelectTrigger className="h-14 rounded-2xl border-slate-200 focus:ring-teal-500/20 font-black bg-slate-50/50 text-slate-700">
                <SelectValue placeholder={t('community.create.select_privacy')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                <SelectItem value="barangay" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <ShieldAlert size={18} />
                    </div>
                    <span>{t('community.create.types.barangay')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="city" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <MapPin size={18} />
                    </div>
                    <span>{t('community.create.types.city')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="lgu" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <Landmark size={18} />
                    </div>
                    <span>{t('community.create.types.lgu')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="school" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <GraduationCap size={18} />
                    </div>
                    <span>{t('community.create.types.school')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="organization" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <Building2 size={18} />
                    </div>
                    <span>{t('community.create.types.organization')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="event" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <Calendar size={18} />
                    </div>
                    <span>{t('community.create.types.event')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="private" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <Lock size={18} />
                    </div>
                    <span>{t('community.create.types.private')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.name}</label>
            <Input 
              required
              placeholder={labels.namePlaceholder}
              className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.description}</label>
            <Textarea 
              required
              placeholder={labels.descPlaceholder}
              className="min-h-[100px] rounded-xl border-slate-200 focus:ring-teal-500/20 font-medium"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2" ref={suggestionRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.location}</label>
            <div className="relative">
              <Input 
                required
                placeholder={labels.locationPlaceholder}
                className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold pr-10 bg-white"
                value={formData.location}
                onChange={(e) => {
                  setFormData({...formData, location: e.target.value});
                  setIsSearchingLocation(true);
                  if (e.target.value.length < 3) {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => formData.location.length >= 3 && locationSuggestions.length > 0 && setShowSuggestions(true)}
              />
              {isSearchingLocation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-teal-500" />
                </div>
              )}

              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-[300] left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <ScrollArea className="max-h-[200px]">
                    <div className="p-1">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-start gap-3 rounded-xl mb-1 last:mb-0"
                          onClick={() => {
                            setFormData({...formData, location: suggestion.display_name});
                            setShowSuggestions(false);
                            setIsSearchingLocation(false);
                          }}
                        >
                          <MapPin size={16} className="text-teal-500 mt-0.5 shrink-0" />
                          <span className="text-xs font-bold leading-tight">
                            {suggestion.display_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('community.create.review.capacity')}</label>
              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {formData.privacy === 'barangay' ? t('community.create.review.sponsored') : t('community.create.review.quota_tier')}
              </span>
            </div>
            <Select 
              value={formData.maxMembers.toString()} 
              onValueChange={(v) => setFormData({...formData, maxMembers: parseInt(v)})}
            >
              <SelectTrigger className="h-14 rounded-2xl border-slate-200 focus:ring-teal-500/20 font-black bg-slate-50/50 text-slate-700">
                <SelectValue placeholder={t('community.create.review.select_capacity')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                {[
                  { value: 100, label: t('community.create.review.members_count', { count: 100 }), price: 0 },
                  { value: 500, label: t('community.create.review.members_count', { count: 500 }), price: 500 },
                  { value: 1000, label: t('community.create.review.members_count', { count: 1000 }), price: 1000 },
                  { value: 5000, label: t('community.create.review.members_count', { count: 5000 }), price: 2500 },
                  { value: 10000, label: t('community.create.review.unlimited'), price: 5000 },
                ].map((tier) => (
                  <SelectItem 
                    key={tier.value} 
                    value={tier.value.toString()} 
                    className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold transition-colors"
                  >
                    <div className="flex items-center justify-between w-full gap-20">
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-slate-400" />
                        <span>{tier.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-teal-600">
                        {formData.privacy === 'barangay' ? t('community.create.review.free') : tier.price === 0 ? 'Base' : `+ ${formatCurrencyPHP(tier.price)}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tight">
              {t('community.create.review.capacity_notice')} {formData.privacy === 'barangay' ? t('community.create.review.sponsored_notice') : ''}
            </p>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="p-6 border-t border-slate-50 flex items-center justify-end gap-3 bg-white relative z-10">
        <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500">
          {t('common.cancel')}
        </Button>
        <Button 
            type="button" 
            disabled={!isFormValid}
            onClick={onNext} 
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100"
        >
          {t('common.continue')} <ArrowRight size={18} className="ml-2" />
        </Button>
      </DialogFooter>
    </form>
  );
};
