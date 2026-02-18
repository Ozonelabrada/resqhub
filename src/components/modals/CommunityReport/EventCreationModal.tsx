import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Button,
  Textarea,
  Alert,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Tag,
  MapPin,
  Phone,
  Calendar,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal/Modal';
import { CommunityReportService, type EventPayload } from '@/services/communityReportService';
import { CategoryService } from '@/services/categoryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '@/utils/geolocation';
import { cn } from '@/lib/utils';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  communityId: string | number;
  isAdmin?: boolean;
  isModerator?: boolean;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  communityId,
  isAdmin = false,
  isModerator = false,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getDefaultDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: getDefaultDateTime(),
    endDate: getDefaultDateTime(),
    category: '',
    location: '',
    contactInfo: '',
    privacy: 'community' as const,
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      if (cats && cats.length > 0) {
        const mappedCategories = cats.map(c => ({
          label: `${c.icon || '🏷️'} ${c.name}`,
          value: Number(c.id)
        }));
        setCategories(mappedCategories);
        if (!formData.category) {
          setFormData(prev => ({ ...prev, category: String(cats[0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(t('form.title') + ' is required');
      return false;
    }
    if (formData.title.trim().length < 5) {
      setError(t('report.error_title_too_short') || 'Title must be at least 5 characters');
      return false;
    }
    if (!formData.description.trim()) {
      setError(t('form.description') + ' is required');
      return false;
    }
    if (!formData.category) {
      setError(t('report.error_category_required') || 'Please select a category');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return false;
    }
    if (!formData.location.trim()) {
      setError(t('form.location') + ' is required');
      return false;
    }
    if (!formData.contactInfo.trim()) {
      setError('Contact info is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(t('report.login_required'));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload: EventPayload = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      category: formData.category,
      location: formData.location,
      contactInfo: formData.contactInfo,
      communityId,
      privacy: formData.privacy,
      type: 'Event',
    };

    const result = await CommunityReportService.createEvent(payload);

    if (result.success) {
      if ((window as any).showToast) {
        (window as any).showToast(
          'success',
          'Success',
          'Event created successfully'
        );
      }

      if (onSuccess) onSuccess();
      onClose();

      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: getDefaultDateTime(),
        endDate: getDefaultDateTime(),
        category: '',
        location: '',
        contactInfo: '',
        privacy: 'community',
      });
    } else {
      setError(result.message || 'Failed to create event');
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
              <Calendar size={24} />
            </div>
            <span>Create Event</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg pt-2">
            Organize an event for your community
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
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              {t('form.title')}
            </label>
            <Input
              type="text"
              placeholder="e.g., Community Cleanup Day"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              {t('form.description')}
            </label>
            <Textarea
              placeholder="Describe your event in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium min-h-24"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              {t('form.category')}
            </label>
            <Select value={formData.category} onValueChange={(value: string) => handleInputChange('category', value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-lg bg-white">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={String(cat.value)}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                Start Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                End Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              {t('form.location')}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g., Community Park"
                value={formData.location}
                onChange={(e) => {
                  handleInputChange('location', e.target.value);
                  setIsSearchingLocation(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(true)}
                className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg z-[301] max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion) => (
                    <div
                      key={`${suggestion.lat}-${suggestion.lon}`}
                      onMouseDown={() => handleSelectLocation(suggestion)}
                      className="px-4 py-3 cursor-pointer hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 border-b border-slate-100 last:border-b-0"
                    >
                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>{suggestion.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-600" />
              Contact Info
            </label>
            <Input
              type="text"
              placeholder="Phone or email for event inquiries"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
            />
          </div>

          {/* Privacy - Only for admins/moderators */}
          {(isAdmin || isModerator) && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                Privacy Status
              </label>
              <Select 
                value={formData.privacy} 
                onValueChange={(value: 'community' | 'internal') => handleInputChange('privacy', value)}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium text-left">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 shadow-lg bg-white">
                  <SelectItem value="community">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Community Visibility</span>
                      <span className="text-[10px] text-slate-500">Visible to all community members</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Internal Only</span>
                      <span className="text-[10px] text-slate-500">Only visible to community admins and moderators</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Form Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EventCreationModal;
