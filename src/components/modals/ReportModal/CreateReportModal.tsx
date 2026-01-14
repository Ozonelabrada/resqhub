import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Input, 
  Button, 
  Textarea,
  Select,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../ui';
import { 
  Plus,
  FileText, 
  MapPin, 
  Tag, 
  Info, 
  DollarSign, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Upload, 
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal/Modal';
import { ReportsService } from '../../../services/reportsService';
import { CategoryService } from '../../../services/categoryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '../../../utils/geolocation';
import { cn } from '../../../lib/utils';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: string;
  communityId?: string | number;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialType,
  communityId
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [categories, setCategories] = useState<{ label: string, value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isHubContext = location.pathname.includes('/hub');
  const isCommunityContext = location.pathname.includes('/community');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 0,
    location: '',
    contactInfo: '',
    rewardDetails: '',
    reportType: initialType || (isCommunityContext ? 'News' : 'Lost')
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // If an initial type is provided, override the default
      if (initialType) {
        setFormData(prev => ({ ...prev, reportType: initialType }));
      }
    }
  }, [isOpen, location.pathname, initialType]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length >= 3 && isSearchingLocation) {
        const results = await searchLocations(formData.location);
        setLocationSuggestions(results);
        setShowSuggestions(true);
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location, isSearchingLocation]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      console.log('Categories loaded for modal:', cats);
      
      if (cats && cats.length > 0) {
        const mappedCategories = cats.map(c => ({ 
          label: `${c.icon || '🏷️'} ${c.name}`, 
          value: Number(c.id) 
        }));
        
        setCategories(mappedCategories);
        
        if (formData.categoryId === 0) {
          setFormData(prev => ({ ...prev, categoryId: Number(cats[0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'location') {
      setIsSearchingLocation(true);
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    setIsSearchingLocation(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      if (imageFiles.length + newFiles.length > 5) {
        setError(t('report.error_max_images') || 'Maximum 5 images allowed');
        return;
      }
      
      setImageFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target?.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError(t('report.login_required'));
        return;
    }

    // Basic Validation
    if (formData.title.trim().length < 5) {
      setError(t('report.error_title_too_short') || 'Title must be at least 5 characters');
      return;
    }

    if (!formData.categoryId) {
      setError(t('report.error_category_required') || 'Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    const formDataPayload = new FormData();
    formDataPayload.append('UserId', String(user.id));
    formDataPayload.append('CategoryId', String(formData.categoryId));
    formDataPayload.append('Title', formData.title);
    formDataPayload.append('Description', formData.description);
    formDataPayload.append('Location', formData.location);
    formDataPayload.append('ContactInfo', formData.contactInfo);
    formDataPayload.append('RewardDetails', formData.rewardDetails || '');
    formDataPayload.append('ReportType', String(formData.reportType));
    
    if (communityId) {
      formDataPayload.append('CommunityId', String(communityId));
    }
    
    // Ensure imageFiles is a flat array and append files
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach(file => {
        if (file instanceof File) {
          formDataPayload.append('ImageFiles', file);
        }
      });
    }

    const result = await ReportsService.createReport(formDataPayload);
    if (result.success) {
      // Show success toast
      if ((window as any).showToast) {
        let successMsg = t('report.success_message_lost');
        if (formData.reportType === 'Found') successMsg = t('report.success_message_found');
        if (formData.reportType === 'News') successMsg = t('hub.success_news');
        if (formData.reportType === 'Discussion') successMsg = t('hub.success_discussion');
        if (formData.reportType === 'Announcements') successMsg = t('hub.success_announcement');

        (window as any).showToast(
          'success', 
          t('report.success_title'), 
          successMsg
        );
      }
      
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].value : 0,
        location: '',
        contactInfo: '',
        rewardDetails: '',
        reportType: 'Lost'
      });
      setImages([]);
      setImageFiles([]);
    } else {
      setError(result.message || 'Failed to create report');
    }
    setLoading(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      className="p-0 border-none rounded-[2.5rem] overflow-y-auto max-h-[90vh]"
    >
        <div className="p-8 md:p-10 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
                <FileText size={24} />
              </div>
              <span>{t('report.create_title')}</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg pt-2">
              {t('report.create_subtitle')}
            </p>
          </div>

          {error && (
            <Alert 
              type="error" 
              message={error}
              className="rounded-2xl border-orange-100 bg-orange-50 text-orange-800" 
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type Selection via Tabs */}
              <div className="space-y-4 col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  {t('report.type_question')}
                </label>
                <Tabs 
                  defaultValue={isCommunityContext ? "News" : "Lost"} 
                  value={formData.reportType} 
                  onValueChange={(val) => handleInputChange('reportType', val)}
                  className="w-full"
                >
                  <TabsList className={cn(
                    "grid w-full p-1 bg-slate-100 rounded-2xl h-auto min-h-14",
                    isCommunityContext ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2"
                  )}>
                    <TabsTrigger 
                      value="Lost" 
                      className="rounded-xl font-bold py-2 transition-all data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {t('report.lost_item')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="Found" 
                      className="rounded-xl font-bold py-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {t('report.found_item')}
                    </TabsTrigger>
                    {isCommunityContext && (
                      <>
                        <TabsTrigger 
                          value="News" 
                          className="rounded-xl font-bold py-2 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                          {t('hub.news')}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="Discussion" 
                          className="rounded-xl font-bold py-2 transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                          {t('hub.discussion')}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="Announcements" 
                          className="rounded-xl font-bold py-2 transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                          {t('hub.announcements')}
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </Tabs>
              </div>

              {/* Title */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-slate-700">{t('report.item_title')}</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('report.item_title_placeholder')}
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t('report.category')}</label>
                <Select
                  value={formData.categoryId}
                  options={categories}
                  onChange={(val) => handleInputChange('categoryId', Number(val))}
                  placeholder={t('report.category_placeholder')}
                  className="rounded-2xl border-slate-100 bg-slate-50"
                />
              </div>

              {/* Location */}
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {t('report.location')}
                </label>
                <div className="relative">
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={t('report.location_placeholder')}
                    required
                    className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                    onBlur={() => {
                      // Small delay to allow onMouseDown to trigger first
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) setShowSuggestions(true);
                    }}
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-[301] w-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          role="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-2 cursor-pointer"
                          onMouseDown={(e) => {
                            // Prevent focus from leaving input immediately
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

              {/* Description */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-slate-700">{t('report.description')}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('report.description_placeholder')}
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600 min-h-[120px]"
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  {t('report.contact_info')}
                </label>
                <Input
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder={t('report.contact_placeholder')}
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>

              {/* Reward */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  {t('report.reward')}
                </label>
                <Input
                  value={formData.rewardDetails}
                  onChange={(e) => handleInputChange('rewardDetails', e.target.value)}
                  placeholder={t('report.reward_placeholder')}
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                {t('report.images')}
              </label>
              
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 group">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm p-1 rounded-full text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-teal-600 hover:border-teal-200">
                    <Upload size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('report.upload')}</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                loading={loading}
                className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold text-lg"
              >
                {t('report.publish')}
                <ShieldCheck className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </div>
    </Modal>
  );
};

export default CreateReportModal;
