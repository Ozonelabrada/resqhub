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
  Shield,
  Camera, 
  Upload, 
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal/Modal';
import { ReportsService, type CreateReportPayload } from '../../../services/reportsService';
import { uploadMultipleImagesToCloudinary } from '../../../services/cloudinaryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '../../../utils/geolocation';
import { cn } from '../../../lib/utils';
import { ResponsiblePostingReminder } from './ResponsiblePostingReminder';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isHubContext = location.pathname.includes('/hub');
  const isCommunityContext = location.pathname.includes('/community');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contactInfo: '',
    rewardDetails: '',
    reportType: initialType || (isCommunityContext ? 'News' : 'Lost'),
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [agreeResponsiblePosting, setAgreeResponsiblePosting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset agreement state every time modal opens
      setAgreeResponsiblePosting(false);
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
        // If user has a saved profile location, keep it as the first suggestion (avoid duplicates)
        const merged = user?.location
          ? (results.some(r => r.display_name === user.location) ? results : [{ display_name: user.location, lat: '', lon: '', name: user.location, address: {} }, ...results])
          : results;
        setLocationSuggestions(merged);
        setShowSuggestions(true);
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location, isSearchingLocation]);

  // If user has a profile location and the location input is empty, surface it as a suggestion
  useEffect(() => {
    if (user?.location && (!formData.location || formData.location.trim() === '')) {
      setLocationSuggestions(prev => {
        if (prev.some(s => s.display_name === user.location)) return prev;
        return [{ display_name: user.location, lat: '', lon: '', name: user.location, address: {} }, ...prev];
      });
    }
  }, [user?.location, formData.location]);

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

    setLoading(true);
    setError('');

    try {
      // Step 1: Upload images to Cloudinary first
      let imageUrls: string[] = [];
      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        try {
          imageUrls = await uploadMultipleImagesToCloudinary(imageFiles);
        } catch (uploadError: any) {
          setError(uploadError.message || 'Failed to upload images. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Step 2: Build JSON payload with Cloudinary URLs
      const reportPayload: CreateReportPayload = {
        userId: String(user.id),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        contactInfo: formData.contactInfo,
        reportType: String(formData.reportType),
        imageUrls: imageUrls,
        rewardDetails: formData.rewardDetails || '',
      };

      // Add communityId if present
      if (communityId) {
        reportPayload.communityId = communityId;
      }

      // Step 3: Create the report with JSON payload
      const result = await ReportsService.createReport(reportPayload);
      if (result.success) {
        // Step 4: Save image URLs to backend if images exist
        if (imageUrls.length > 0 && result.data?.id) {
          const reportId = result.data.id;
          try {
            await ReportsService.saveReportImages(reportId, imageUrls);
          } catch (imageError: any) {
            console.error('Error saving images to backend:', imageError);
            // Don't fail the whole operation if image saving fails
            // Images are already in Cloudinary and linked via JSON payload
          }
        }

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
          location: '',
          contactInfo: '',
          rewardDetails: '',
          reportType: 'Lost',
        });
        setImages([]);
        setImageFiles([]);
      } else {
        setError(result.message || t('report.error_failed_to_create'));
      }
    } catch (error: any) {
      console.error('Report creation error:', error);
      setError(error.message || t('report.error_failed_to_create') || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      className="p-0 border-none rounded-[2.5rem] overflow-y-auto max-h-[90vh]"
    >
        <div className="p-8 md:p-10 space-y-8">
          {/* Header - Always Visible */}
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

          {/* Step 1: Responsible Posting Reminder Gate */}
          {!agreeResponsiblePosting ? (
            <div className="space-y-6">
              <ResponsiblePostingReminder 
                isChecked={agreeResponsiblePosting}
                onChange={setAgreeResponsiblePosting}
              />
            </div>
          ) : (
            /* Step 2: Report Form - Only visible after agreement */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type Selection via Tabs */}
              <div className="space-y-4 col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  {t('report.type_question')}
                </label>
                <Tabs 
                  defaultValue={isCommunityContext ? "Lost" : "Lost"} 
                  value={formData.reportType} 
                  onValueChange={(val) => handleInputChange('reportType', val)}
                  className="w-full"
                >
                  <TabsList className={cn(
                    "grid w-full p-1 bg-slate-100 rounded-2xl h-auto min-h-14",
                    "grid-cols-2"
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

              {/* Location */}
              <div className="space-y-2 relative col-span-2">
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
                      {locationSuggestions.map((suggestion) => (
                        <div
                          key={`${suggestion.lat}-${suggestion.lon}`}
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
          )}
        </div>
    </Modal>
  );
};

export default CreateReportModal;
