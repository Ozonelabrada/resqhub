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
  Plus,
  AlertCircle,
  X,
  Tag,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchLocations, type LocationSuggestion } from '@/utils/geolocation';

export interface CalendarEntry {
  id: string;
  fromDate: string;
  toDate: string;
  time?: string;
  title: string;
  description: string;
  category: string;
  location?: string;
}

export interface CreateCalendarFormData {
  calendarEntries: CalendarEntry[];
  isActive: boolean;
}

export interface CreateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: CreateCalendarFormData) => void;
  type?: 'announcement' | 'events';
}

const INITIAL_FORM_DATA: CreateCalendarFormData = {
  calendarEntries: [
    {
      id: '1',
      fromDate: '',
      toDate: '',
      time: '',
      title: '',
      description: '',
      category: '',
      location: '',
    },
  ],
  isActive: true,
};

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type = 'events',
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCalendarFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionEntryId, setActiveSuggestionEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activeSuggestionEntryId && isSearchingLocation) {
        const entry = formData.calendarEntries.find(e => e.id === activeSuggestionEntryId);
        if (entry && entry.location && entry.location.length >= 3) {
          const results = await searchLocations(entry.location);
          setLocationSuggestions(results);
          setShowSuggestions(true);
          setIsSearchingLocation(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.calendarEntries, activeSuggestionEntryId, isSearchingLocation]);

  const validateForm = (): boolean => {
    if (formData.calendarEntries.length === 0) {
      setError(t('calendar.entry_required') || 'At least one calendar entry is required');
      return false;
    }
    
    const hasValidEntry = formData.calendarEntries.some(
      (entry) => entry.fromDate && entry.toDate && entry.title && entry.description && entry.category
    );
    if (!hasValidEntry) {
      setError(t('calendar.entry_complete_required') || 'At least one complete calendar entry (from date, to date, title, description, and category) is required');
      return false;
    }

    // Validate that fromDate is before or equal to toDate
    for (const entry of formData.calendarEntries) {
      if (entry.fromDate && entry.toDate) {
        if (new Date(entry.fromDate) > new Date(entry.toDate)) {
          setError('End date (to date) must be after or equal to start date (from date)');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (onSuccess) {
        onSuccess(formData);
      }
      onClose();
    } catch (err) {
      setError(t('common.error') || 'An error occurred');
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (suggestion: LocationSuggestion, entryId: string) => {
    setFormData((prev) => ({
      ...prev,
      calendarEntries: prev.calendarEntries.map((entry) =>
        entry.id === entryId ? { ...entry, location: suggestion.display_name } : entry
      ),
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    setActiveSuggestionEntryId(null);
  };

  const handleInputChange = (field: keyof Omit<CreateCalendarFormData, 'calendarEntries'>, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  const handleEntryChange = (id: string, field: keyof CalendarEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      calendarEntries: prev.calendarEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    }));
    if (error) setError('');
  };

  const addEntry = () => {
    const newId = (Math.max(...formData.calendarEntries.map(e => parseInt(e.id) || 0)) + 1).toString();
    setFormData((prev) => ({
      ...prev,
      calendarEntries: [
        ...prev.calendarEntries,
        {
          id: newId,
          fromDate: '',
          toDate: '',
          time: '',
          title: '',
          description: '',
          category: '',
          location: '',
        },
      ],
    }));
  };

  const removeEntry = (id: string) => {
    if (formData.calendarEntries.length > 1) {
      setFormData((prev) => ({
        ...prev,
        calendarEntries: prev.calendarEntries.filter((entry) => entry.id !== id),
      }));
    }
  };

  const typeLabel = type === 'events' ? 'Event Calendar' : 'Announcement Calendar';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-left bg-white border-b border-slate-100 shrink-0">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
              <Calendar size={24} />
            </div>
            <span>{typeLabel}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-3">
            Create a calendar with multiple date entries
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <Alert className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 ml-2 font-bold">{error}</span>
            </Alert>
          )}

          {/* Calendar Entries Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                {t('calendar.entries') || 'Calendar Entries'} <span className="text-red-500">*</span>
              </label>
              <Button
                onClick={addEntry}
                className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg shadow-teal-100 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                {t('calendar.add_date') || 'Add Date'}
              </Button>
            </div>

            <div className="space-y-4">
              {formData.calendarEntries.map((entry, index) => (
                <div key={entry.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-700 text-sm">{t('calendar.entry') || 'Entry'} {index + 1}</h4>
                    {formData.calendarEntries.length > 1 && (
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {t('calendar.event_title') || 'Event Title'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder={t('calendar.event_title_placeholder') || 'e.g., Community Cleanup'}
                      value={entry.title}
                      onChange={(e) => handleEntryChange(entry.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {t('form.description') || 'Description'} <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder={t('form.descriptionPlaceholder') || 'Enter event description...'}
                      value={entry.description}
                      onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* From Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {t('form.startDate') || 'From Date'} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={entry.fromDate}
                        onChange={(e) => handleEntryChange(entry.id, 'fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm"
                      />
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {t('form.endDate') || 'To Date'} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={entry.toDate}
                        onChange={(e) => handleEntryChange(entry.id, 'toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Clock size={12} />
                        {t('form.time') || 'Time'} <span className="text-slate-400">(Optional)</span>
                      </label>
                      <Input
                        type="time"
                        value={entry.time || ''}
                        onChange={(e) => handleEntryChange(entry.id, 'time', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Tag size={12} />
                        {t('form.category') || 'Category'} <span className="text-red-500">*</span>
                      </label>
                      <Select value={entry.category} onValueChange={(value) => handleEntryChange(entry.id, 'category', value)}>
                        <SelectTrigger className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm">
                          <SelectValue placeholder={t('form.selectCategory') || 'Select a category'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mission">Mission</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Celebration">Celebration</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {t('calendar.location_label') || 'Location'} <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder={t('calendar.location_placeholder') || 'e.g., Community Park'}
                        value={entry.location || ''}
                        onChange={(e) => {
                          handleEntryChange(entry.id, 'location', e.target.value);
                          setActiveSuggestionEntryId(entry.id);
                          setIsSearchingLocation(true);
                          setShowSuggestions(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onFocus={() => {
                          setActiveSuggestionEntryId(entry.id);
                          setShowSuggestions(true);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-sm"
                      />
                      {showSuggestions && activeSuggestionEntryId === entry.id && locationSuggestions.length > 0 && (
                        <div className="absolute z-[301] w-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                          {locationSuggestions.map((suggestion) => (
                            <div
                              key={`${suggestion.lat}-${suggestion.lon}`}
                              role="button"
                              className="w-full text-left px-4 py-3 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-2 cursor-pointer"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectLocation(suggestion, entry.id);
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 shrink-0 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            className="h-12 px-8 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-2xl transition-all"
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 px-8 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-black rounded-2xl shadow-xl shadow-teal-100 transition-all flex items-center gap-2"
          >
            {loading ? t('hub.creating') || 'Creating...' : 'Create Calendar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCalendarModal;
