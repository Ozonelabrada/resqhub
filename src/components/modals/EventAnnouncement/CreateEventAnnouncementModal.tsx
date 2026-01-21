import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../ui';
import {
  Input,
  Button,
  Textarea,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
} from '../../ui';
import {
  Calendar,
  Clock,
  FileText,
  Tag,
  Camera,
  AlertCircle,
  X,
  Upload,
  MapPin,
  Phone,
  Link as LinkIcon,
  Shield,
  Eye,
} from 'lucide-react';
import { CommunityService } from '../../../services/communityService';

// Types
export type ContentType = 'announcement' | 'news' | 'events';

export interface EventAnnouncementFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  time?: string;
  category: string;
  isActive: boolean;
  type: ContentType;
  location?: string;
  contactInfo?: string;
  reportUrl?: string;
  communityId?: number | string;
  privacy?: 'community' | 'internal';
}

export interface CreateEventAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: EventAnnouncementFormData) => void;
  type?: ContentType;
  initialData?: Partial<EventAnnouncementFormData>;
  communityId?: number | string;
  isAdmin?: boolean;
  isModerator?: boolean;
}

const INITIAL_FORM_DATA: EventAnnouncementFormData = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  time: '',
  category: '',
  isActive: true,
  type: 'announcement',
  location: '',
  contactInfo: '',
  reportUrl: '',
  communityId: undefined,
  privacy: 'community',
};

const CreateEventAnnouncementModal: React.FC<CreateEventAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type = 'announcement',
  initialData,
  communityId,
  isAdmin = false,
  isModerator = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EventAnnouncementFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState<ContentType>(type);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Update contentType when the type prop changes
  useEffect(() => {
    if (type) {
      setContentType(type);
    }
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM_DATA,
        type: contentType,
        communityId,
        ...initialData,
      });
      setError('');
    }
  }, [isOpen, contentType, initialData, communityId]);

  const contentTypeLabels: Record<ContentType, string> = {
    announcement: t('hub.announcement') || 'Announcement',
    news: t('hub.news') || 'News',
    events: t('hub.events') || 'Events',
  };

  const contentTypeDescriptions: Record<ContentType, string> = {
    announcement: 'Create and share important announcements with your community',
    news: 'Share the latest news and updates',
    events: 'Create and manage events with dates and times',
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(t('community.eventAnnouncement.validation.titleRequired') || 'Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError(t('community.eventAnnouncement.validation.descriptionRequired') || 'Description is required');
      return false;
    }
    if (!formData.startDate) {
      setError(t('community.eventAnnouncement.validation.startDateRequired') || 'Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError(t('community.eventAnnouncement.validation.endDateRequired') || 'End date is required');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError(t('community.eventAnnouncement.validation.endDateAfterStart') || 'End date must be after start date');
      return false;
    }
    if (!formData.category) {
      setError(t('community.eventAnnouncement.validation.categoryRequired') || 'Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // If communityId is provided, submit to API
      if (communityId) {
        // Convert dates to ISO 8601 format
        // Date input gives us YYYY-MM-DD, we need to convert to ISO datetime
        const startDateTime = formData.time 
          ? new Date(`${formData.startDate}T${formData.time}`).toISOString()
          : new Date(`${formData.startDate}T00:00:00`).toISOString();
        
        const endDateTime = formData.time
          ? new Date(`${formData.endDate}T${formData.time}`).toISOString()
          : new Date(`${formData.endDate}T23:59:59`).toISOString();

        console.log(`Submitting ${formData.type} with dates:`, {
          startDateTime,
          endDateTime,
          startDate: formData.startDate,
          endDate: formData.endDate,
          time: formData.time
        });

        // Use calendar API for events, announcement API for announcements/news
        if (formData.type === 'events') {
          const result = await CommunityService.createCalendarEvents({
            communityId,
            events: [
              {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                fromDate: startDateTime,
                toDate: endDateTime, // Modal sends toDate
                time: formData.time || '00:00',
                location: formData.location || '',
                privacy: formData.privacy || 'community',
              }
            ]
          });

          if (!result.success) {
            setError(result.message || 'Failed to create event');
            setLoading(false);
            return;
          }
          
          console.log('Event created successfully:', result.data);
        } else {
          // Use announcement API for announcements and news
          const result = await CommunityService.createAnnouncement({
            title: formData.title,
            description: formData.description,
            startDate: startDateTime,
            endDate: endDateTime,
            reportUrl: formData.reportUrl || '',
            category: formData.category || 'general',
            type: formData.type,
            location: formData.location || '',
            contactInfo: formData.contactInfo || '',
            communityId,
            privacy: formData.privacy || 'community',
          });

          if (!result.success) {
            setError(result.message || `Failed to create ${formData.type}`);
            setLoading(false);
            return;
          }
          
          console.log(`${formData.type} created successfully:`, result.data);
        }
      }

      // Call the onSuccess callback with form data
      if (onSuccess) {
        onSuccess(formData);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventAnnouncementFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  const handleTypeChange = (newType: ContentType) => {
    setContentType(newType);
    setFormData((prev) => ({
      ...prev,
      type: newType,
    }));
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with Close Button */}
        <div className="px-8 pt-8 pb-4 text-left bg-white border-b border-slate-100 shrink-0">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
              {contentType === 'announcement' && <FileText size={24} />}
              {contentType === 'news' && <FileText size={24} />}
              {contentType === 'events' && <Calendar size={24} />}
            </div>
            <span>{contentTypeLabels[contentType]}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-3">
            {contentTypeDescriptions[contentType]}
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Content Type Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              {t('form.type') || 'Type'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['announcement', 'news', 'events'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  disabled={contentType !== type}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-center ${
                    contentType === type
                      ? 'bg-teal-500 text-white shadow-lg cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {contentTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 ml-2 font-bold">{error}</span>
            </Alert>
          )}

          {/* Title Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              {t('form.title') || 'Title'} <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder={t('form.titlePlaceholder') || 'Enter title'}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Description Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              {t('form.description') || 'Description'} <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder={t('form.descriptionPlaceholder') || 'Enter detailed description'}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium min-h-[120px] resize-none"
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                {t('form.startDate') || 'Start Date'} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                {t('form.endDate') || 'End Date'} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Time Field (Optional) */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              {t('form.time') || 'Time'} ({t('form.optional') || 'Optional'})
            </label>
            <Input
              type="time"
              value={formData.time || ''}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Category Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="h-4 w-4 text-teal-600" />
              {t('form.category') || 'Category'} <span className="text-red-500">*</span>
            </label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium">
                <SelectValue placeholder={t('form.selectCategory') || 'Select a category'} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-lg bg-white">
                <SelectItem key="cat-general" value="general">{t('categories.general') || 'General'}</SelectItem>
                <SelectItem key="cat-urgent" value="urgent">{t('categories.urgent') || 'Urgent'}</SelectItem>
                <SelectItem key="cat-community" value="community">{t('categories.community') || 'Community'}</SelectItem>
                <SelectItem key="cat-educational" value="educational">{t('categories.educational') || 'Educational'}</SelectItem>
                <SelectItem key="cat-entertainment" value="entertainment">{t('categories.entertainment') || 'Entertainment'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Status Field - Only for admins/moderators */}
          {(isAdmin || isModerator) && (
            <div className="mb-6 space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Eye className="h-4 w-4 text-teal-600" />
                Privacy Status <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.privacy} 
                onValueChange={(value: 'community' | 'internal') => handleInputChange('privacy', value)}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 shadow-lg bg-white">
                  <SelectItem value="community">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-bold">Community Visibility</span>
                      <span className="text-[10px] text-slate-500">Visible to all community members</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-bold">Internal Only</span>
                      <span className="text-[10px] text-slate-500">Only visible to community admins and moderators</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" />
              {t('form.location') || 'Location'} ({t('form.optional') || 'Optional'})
            </label>
            <Input
              placeholder={t('form.locationPlaceholder') || 'Enter location'}
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Contact Info Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-600" />
              {t('form.contactInfo') || 'Contact Information'} ({t('form.optional') || 'Optional'})
            </label>
            <Input
              placeholder={t('form.contactPlaceholder') || 'Enter phone or email'}
              value={formData.contactInfo || ''}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Report URL Field */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-teal-600" />
              {t('form.reportUrl') || 'Report URL'} ({t('form.optional') || 'Optional'})
            </label>
            <Input
              type="url"
              placeholder={t('form.urlPlaceholder') || 'https://example.com'}
              value={formData.reportUrl || ''}
              onChange={(e) => handleInputChange('reportUrl', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6 space-y-4 pt-6 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <Camera className="h-4 w-4 text-teal-600" />
              {t('report.images') || 'Images'} ({t('form.optional') || 'Optional'})
            </label>
            
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group bg-slate-50">
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
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-teal-600 hover:border-teal-400">
                  <Upload size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t('report.upload') || 'Upload'}</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="mb-6 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-bold text-slate-700">
                {t('form.isActive') || 'Active'}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-4 bg-white border-t border-slate-200 flex gap-3 justify-end shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-teal-100"
          >
            {loading ? t('common.creating') || 'Creating...' : t('common.create') || 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventAnnouncementModal;
