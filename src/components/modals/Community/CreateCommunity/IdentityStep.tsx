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
import { Lock, ShieldAlert, ArrowRight, GraduationCap, Calendar, Building2, MapPin, Landmark, Loader2, Users, Upload, X } from 'lucide-react';
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
    <form className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-6 sm:px-8 py-6">
        <div className="space-y-6 pb-28 pr-4 max-w-3xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{t('community.create.type_privacy')}</label>
            <Select 
              value={formData.privacy} 
              onValueChange={(v: any) => {
                // Auto-set unlimited members for public organizations
                const isPublicOrg = v === 'barangay' || v === 'lgu';
                setFormData({
                  ...formData, 
                  privacy: v,
                  maxMembers: isPublicOrg ? 10000 : formData.maxMembers
                });
              }}
            >
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
              className="h-12 sm:h-14 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold text-base placeholder:text-slate-400"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.description}</label>
            <Textarea 
              required
              placeholder={labels.descPlaceholder}
              className="min-h-[120px] rounded-xl border-slate-200 focus:ring-teal-500/20 font-medium text-base placeholder:text-slate-400"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Community Banner Image <span className="text-slate-300">(Optional)</span></label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(input) => {
                  if (input && !input.id) {
                    input.id = 'banner-upload';
                  }
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      setFormData({...formData, imageUrl: base64});
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {!formData.imageUrl ? (
                <label 
                  htmlFor="banner-upload"
                  className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-colors cursor-pointer bg-slate-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Upload size={20} className="text-teal-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-50">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('banner-upload') as HTMLInputElement;
                        if (input) input.value = '';
                        setFormData({...formData, imageUrl: ''});
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors"
                    >
                      <X size={16} /> Remove
                    </button>
                    <label 
                      htmlFor="banner-upload"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold text-sm transition-colors cursor-pointer border border-teal-200"
                    >
                      <Upload size={16} /> Change
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2" ref={suggestionRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{labels.location}</label>
            <div className="relative">
              <Input 
                required
                placeholder={labels.locationPlaceholder}
                className="h-12 sm:h-14 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold text-base placeholder:text-slate-400 pr-10 bg-white"
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
                      {locationSuggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.lat}-${suggestion.lon}`}
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
              {(formData.privacy === 'barangay' || formData.privacy === 'lgu') ? (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1.5">
                  <span>✓</span> {t('community.create.review.unlimited')}
                </span>
              ) : (
                <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {t('community.create.review.quota_tier')}
                </span>
              )}
            </div>
            
            {(formData.privacy === 'barangay' || formData.privacy === 'lgu') ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs font-bold text-emerald-900">
                  🏛️ Public organizations automatically have unlimited members.
                </p>
                <p className="text-[10px] text-emerald-700 mt-1">
                  {formData.privacy === 'barangay' 
                    ? 'Barangays can accommodate all residents in the community.'
                    : 'Municipalities can accommodate all constituents in the community.'}
                </p>
              </div>
            ) : (
              <Select 
                value={formData.maxMembers.toString()} 
                onValueChange={(v) => setFormData({...formData, maxMembers: parseInt(v)})}
              >
                <SelectTrigger className="h-12 sm:h-14 rounded-xl border-slate-200 focus:ring-teal-500/20 font-black bg-white text-slate-700 text-base">
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
            )}
            <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tight">
              {t('community.create.review.capacity_notice')} {formData.privacy === 'barangay' ? t('community.create.review.sponsored_notice') : ''}
            </p>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-gradient-to-r from-white to-slate-50 relative z-20 sticky bottom-0 flex-shrink-0">
        <Button 
            type="button" 
            disabled={!isFormValid}
            onClick={onNext} 
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black px-6 sm:px-8 h-11 rounded-lg shadow-lg shadow-teal-100 flex items-center gap-2 whitespace-nowrap"
        >
          {t('common.continue')} <ArrowRight size={18} />
        </Button>
      </DialogFooter>
    </form>
  );
};
