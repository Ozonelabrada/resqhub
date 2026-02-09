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
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal/Modal';
import { CommunityReportService, type EventPayload } from '@/services/communityReportService';
import { CategoryService } from '@/services/categoryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '@/utils/geolocation';
import { cn } from '@/lib/utils';

type EventType = 'single-day' | 'range-days' | 'calendar-annual';
type EventMode = 'single' | 'multiple' | null;

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  location: string;
  contactInfo: string;
  privacy: 'community' | 'internal';
}

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
  const [eventMode, setEventMode] = useState<EventMode>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const defaultEventData: EventData = {
    id: Date.now().toString(),
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    location: '',
    contactInfo: '',
    privacy: 'community' as const,
  };

  const [formData, setFormData] = useState(defaultEventData);
  const [multipleEvents, setMultipleEvents] = useState<EventData[]>([defaultEventData]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    } else {
      // Reset all state when modal closes
      setEventMode(null);
      setEventType(null);
      setError('');
      setCurrentEventIndex(0);
      setFormData(defaultEventData);
      setMultipleEvents([defaultEventData]);
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
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    
    if (eventMode === 'multiple') {
      const updatedEvents = [...multipleEvents];
      updatedEvents[currentEventIndex] = updated;
      setMultipleEvents(updatedEvents);
    }
  };

  const addEvent = () => {
    // Save current formData to multipleEvents before adding new event
    const updatedEvents = [...multipleEvents];
    updatedEvents[currentEventIndex] = formData;
    
    const newEvent: EventData = {
      id: Date.now().toString(),
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: '',
      location: '',
      contactInfo: '',
      privacy: 'community',
    };
    
    setMultipleEvents([...updatedEvents, newEvent]);
    setCurrentEventIndex(updatedEvents.length);
    setFormData(newEvent);
  };

  const removeEvent = (index: number) => {
    if (multipleEvents.length > 1) {
      // Save current formData to multipleEvents before removing
      const savingEvents = [...multipleEvents];
      savingEvents[currentEventIndex] = formData;
      
      const updated = savingEvents.filter((_, i) => i !== index);
      setMultipleEvents(updated);
      
      let newIndex = currentEventIndex;
      if (currentEventIndex >= updated.length) {
        newIndex = updated.length - 1;
      }
      
      setCurrentEventIndex(newIndex);
      setFormData(updated[newIndex] || updated[0]);
    }
  };

  const switchEvent = (index: number) => {
    // Save current formData to multipleEvents before switching
    if (eventMode === 'multiple') {
      const updatedEvents = [...multipleEvents];
      updatedEvents[currentEventIndex] = formData;
      setMultipleEvents(updatedEvents);
      
      // Load selected event into form from the updated events
      setCurrentEventIndex(index);
      setFormData(updatedEvents[index]);
      setError('');
    } else {
      setCurrentEventIndex(index);
      setFormData(multipleEvents[index]);
      setError('');
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateForm = (data: EventData = formData): boolean => {
    if (!data.title.trim()) {
      setError(t('form.title') + ' is required');
      return false;
    }
    if (data.title.trim().length < 5) {
      setError(t('report.error_title_too_short') || 'Title must be at least 5 characters');
      return false;
    }
    if (!data.description.trim()) {
      setError(t('form.description') + ' is required');
      return false;
    }
    if (!data.category) {
      setError(t('report.error_category_required') || 'Please select a category');
      return false;
    }
    if (!data.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!data.endDate) {
      setError('End date is required');
      return false;
    }
    if (eventType !== 'single-day' && new Date(data.endDate) < new Date(data.startDate)) {
      setError('End date must be after or equal to start date');
      return false;
    }
    if (!data.location.trim()) {
      setError(t('form.location') + ' is required');
      return false;
    }
    if (!data.contactInfo.trim()) {
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

    // Handle multiple events
    if (eventMode === 'multiple') {
      // Save current formData to multipleEvents before validation
      const eventsToSubmit = [...multipleEvents];
      eventsToSubmit[currentEventIndex] = formData;
      
      // Validate all events
      for (let i = 0; i < eventsToSubmit.length; i++) {
        if (!validateForm(eventsToSubmit[i])) {
          setCurrentEventIndex(i);
          setFormData(eventsToSubmit[i]);
          return;
        }
      }

      setLoading(true);

      try {
        let successCount = 0;
        for (const event of eventsToSubmit) {
          const payload: EventPayload = {
            title: event.title,
            description: event.description,
            startDate: new Date(event.startDate).toISOString(),
            endDate: new Date(event.endDate).toISOString(),
            category: event.category,
            location: event.location,
            contactInfo: event.contactInfo,
            communityId,
            privacy: event.privacy,
            type: 'Event',
            eventType: eventType || 'single-day',
          } as any;

          const result = await CommunityReportService.createEvent(payload);
          if (result.success) {
            successCount++;
          }
        }

        if (successCount === eventsToSubmit.length) {
          if ((window as any).showToast) {
            (window as any).showToast(
              'success',
              'Success',
              `${successCount} events created successfully`
            );
          }
          if (onSuccess) onSuccess();
          setEventMode(null);
          setEventType(null);
          setCurrentEventIndex(0);
          setFormData(defaultEventData);
          setMultipleEvents([defaultEventData]);
          onClose();
        } else {
          setError(`Only ${successCount} out of ${eventsToSubmit.length} events were created. Please try again.`);
        }
      } catch (err) {
        setError('Failed to create events. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle single event
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
      eventType: eventType || 'single-day',
    } as any;

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
      
      // Reset form and event type
      setEventMode(null);
      setEventType(null);
      onClose();

      // Reset form data
      setFormData(defaultEventData);
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
            <span>Create Event{eventMode === 'multiple' && 's'}</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg pt-2">
            {eventMode === 'multiple' 
              ? 'Create multiple events at once for your community' 
              : 'Organize an event for your community'}
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            className="rounded-2xl border-orange-100 bg-orange-50 text-orange-800"
          />
        )}

        {/* Event Mode Selection */}
        {!eventMode ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">How many events do you want to create?</h3>
              <p className="text-slate-500 font-medium">Choose whether to create a single event or multiple events</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Single Event */}
              <button
                onClick={() => setEventMode('single')}
                className="p-8 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="space-y-3 text-left">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-xl flex items-center justify-center group-hover:text-teal-600 transition-colors text-slate-600">
                    <Calendar size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 group-hover:text-teal-600 text-lg">Single Event</h4>
                  <p className="text-sm text-slate-500">Create one event at a time</p>
                </div>
              </button>

              {/* Multiple Events */}
              <button
                onClick={() => setEventMode('multiple')}
                className="p-8 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="space-y-3 text-left">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-xl flex items-center justify-center group-hover:text-teal-600 transition-colors text-slate-600">
                    <Plus size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 group-hover:text-teal-600 text-lg">Multiple Events</h4>
                  <p className="text-sm text-slate-500">Create multiple events in one go</p>
                </div>
              </button>
            </div>
          </div>
        ) : !eventType ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button
                onClick={() => {
                  setEventMode(null);
                  setError('');
                }}
                className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-2"
              >
                ← Back to Mode Selection
              </button>
              <div className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                {eventMode === 'multiple' ? 'Multiple Events' : 'Single Event'}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">Select Event Type</h3>
              <p className="text-slate-500 font-medium">Choose what kind of event you want to create</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Single Day Event */}
              <button
                onClick={() => setEventType('single-day')}
                className="p-6 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="space-y-3 text-left">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-xl flex items-center justify-center group-hover:text-teal-600 transition-colors">
                    <Calendar size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 group-hover:text-teal-600">Single Day Event</h4>
                  <p className="text-sm text-slate-500">Event happening on one specific day</p>
                </div>
              </button>

              {/* Range of Days Event */}
              <button
                onClick={() => setEventType('range-days')}
                className="p-6 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="space-y-3 text-left">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-xl flex items-center justify-center group-hover:text-teal-600 transition-colors">
                    <Calendar size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 group-hover:text-teal-600">Range of Days</h4>
                  <p className="text-sm text-slate-500">Event spanning multiple days</p>
                </div>
              </button>

              {/* Calendar/Annual Event */}
              <button
                onClick={() => setEventType('calendar-annual')}
                className="p-6 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="space-y-3 text-left">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-xl flex items-center justify-center group-hover:text-teal-600 transition-colors">
                    <Calendar size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 group-hover:text-teal-600">Annual/Calendar Event</h4>
                  <p className="text-sm text-slate-500">Whole year or recurring event</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Back Button & Type Info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setEventType(null);
                    setError('');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-2"
                >
                  ← Back to Type Selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                {eventMode === 'multiple' && (
                  <div className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                    Event {currentEventIndex + 1} of {multipleEvents.length}
                  </div>
                )}
                <div className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                  {eventType === 'single-day' ? 'Single Day' : eventType === 'range-days' ? 'Range of Days' : 'Annual/Calendar'}
                </div>
              </div>
            </div>

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

            {/* Date Fields - Conditional based on event type */}
            {eventType === 'single-day' ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Event Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => {
                    handleInputChange('startDate', e.target.value);
                    handleInputChange('endDate', e.target.value);
                  }}
                  className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
                />
              </div>
            ) : eventType === 'range-days' ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Start Month & Year
                  </label>
                  <Input
                    type="month"
                    value={formData.startDate.slice(0, 7)}
                    onChange={(e) => {
                      const date = new Date(e.target.value + '-01');
                      handleInputChange('startDate', date.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    End Month & Year
                  </label>
                  <Input
                    type="month"
                    value={formData.endDate.slice(0, 7)}
                    onChange={(e) => {
                      const date = new Date(e.target.value + '-01');
                      handleInputChange('endDate', date.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
                  />
                </div>
              </div>
            )}

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
                type="button"
                onClick={() => {
                  setEventType(null);
                  setError('');
                }}
                variant="outline"
                className="flex-1 h-14 px-8 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50"
              >
                Back
              </Button>
              {eventMode === 'multiple' && (
                <Button
                  type="button"
                  onClick={addEvent}
                  disabled={loading}
                  className="flex-1 h-14 px-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Event
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : eventMode === 'multiple' ? `Create ${multipleEvents.length} Events` : 'Create Event'}
              </Button>
            </div>

            {/* Multiple Events List */}
            {eventMode === 'multiple' && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase mb-4">Events List ({multipleEvents.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {multipleEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      onClick={() => switchEvent(idx)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        currentEventIndex === idx
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{event.title || `Event ${idx + 1}`}</p>
                        <p className="text-xs text-slate-400">{event.startDate}</p>
                      </div>
                      {multipleEvents.length > 1 && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEvent(idx);
                          }}
                          className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default EventCreationModal;
