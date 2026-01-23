import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Textarea,
  Select,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  Spinner
} from '../../ui';
import { 
  FileText, 
  MapPin, 
  Tag, 
  DollarSign, 
  Phone,
  Camera,
  Upload,
  X,
  Save
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal/Modal';
import { ReportsService, type LostFoundItem } from '../../../services/reportsService';
import { CategoryService } from '../../../services/categoryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '../../../utils/geolocation';
import { cn } from '../../../lib/utils';
import { showToast } from '../../../types/window';
import { extractReportData, validateReportData } from '../../../utils/reportDataExtractor';
import type { FormSubmitEvent } from '../../../types/events';

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  report: LostFoundItem;
}

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  contactInfo: string;
  rewardDetails: string | number;
  reportType: string;
}

interface Category {
  label: string;
  value: string;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  report
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    contactInfo: '',
    rewardDetails: '',
    reportType: 'Lost'
  });
  // Debug effect to log category matching
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const matched = categories.find(c => String(c.value) === String(formData.categoryId));
      console.log('Category match debug:', {
        selectedValue: formData.categoryId,
        selectedValueType: typeof formData.categoryId,
        categories: categories.map(c => ({ label: c.label, value: c.value, type: typeof c.value })),
        matched: matched?.label
      });
    }
  }, [formData.categoryId, categories]);
  
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load categories first, then initialize form data
      const initializeForm = async () => {
        await loadCategories();
        
        // Use type-safe extraction
        const extractedData = extractReportData(report);
        
        setFormData({
          title: extractedData.title,
          description: extractedData.description,
          categoryId: extractedData.categoryId,
          location: extractedData.location,
          contactInfo: String(extractedData.contactInfo),
          rewardDetails: extractedData.rewardDetails,
          reportType: extractedData.reportType
        });
        setError('');
      };
      
      initializeForm();
    }
  }, [isOpen, report]);

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

  const loadCategories = async (): Promise<Category[]> => {
    try {
      const cats = await CategoryService.getCategories();
      
      if (cats && cats.length > 0) {
        const mappedCategories: Category[] = cats.map(c => ({ 
          label: `${c.icon || '🏷️'} ${c.name}`, 
          value: String(c.id)
        }));
        
        setCategories(mappedCategories);
        return mappedCategories;
      }
      return [];
    } catch (err) {
      console.error('Failed to load categories', err);
      return [];
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'location') {
      setIsSearchingLocation(true);
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion): void => {
    setFormData(prev => ({ ...prev, location: String(suggestion.display_name || suggestion.name || '') }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    setIsSearchingLocation(false);
  };

  const handleSubmit = async (e: FormSubmitEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    // Validate using type-safe validator
    const validation = validateReportData(formData);
    if (!validation.valid) {
      setError(validation.errors[0] || 'Please check your input');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ReportsService.updateReport(Number(report.id || 0), {
        ...formData,
        categoryId: Number(formData.categoryId || 0) // Convert string back to number for API
      });

      if (result.success) {
        // Show success toast
        let successMsg = t('report.success_message_lost');
        if (formData.reportType === 'Found') successMsg = t('report.success_message_found');

        showToast(
          'success', 
          t('report.success_title') || 'Report Updated',
          successMsg || 'Your report has been successfully updated.'
        );

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(result.message || t('report.error_failed_to_update') || 'Failed to update report');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Update failed:', err);
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
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
              <FileText size={24} />
            </div>
            <span>{t('report.edit_title') || 'Edit Report'}</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg pt-2">
            {t('report.edit_subtitle') || 'Update the details of your report'}
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
                onChange={(val) => handleInputChange('categoryId', val)}
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

          <div className="pt-6">
            <Button
              type="submit"
              loading={loading}
              className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold text-lg"
            >
              {t('report.edit') || 'Edit'}
              <Save className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditReportModal;
