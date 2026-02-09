import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Button, 
  Input,
} from '@/components/ui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from 'i18next';
import { X, Globe, Lock, Calendar, Plus, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/common/RichTextEditor/RichTextEditor';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  content: z.string().min(1, 'Content is required').min(10, 'Content must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required').min(3, 'Location must be at least 3 characters'),
  contactInfo: z.string().min(1, 'Contact info is required').min(3, 'Contact info must be at least 3 characters'),
  privacy: z.enum(['public', 'internal']),
});

export type EventFormData = z.infer<typeof eventSchema>;

type EventMode = 'single' | 'multiple' | null;

interface EventDataForm extends EventFormData {
  id: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData | EventFormData[]) => void;
  communityId: string;
}

// Helper function to calculate days between two dates
const calculateDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
};

// Helper function to add days to a date
const addDaysToDate = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days - 1);
  return date.toISOString().split('T')[0];
};

// Helper function to format date and time for display
const formatEventDateTime = (date: string, time: string): string => {
  if (!date) return '';
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  if (time) {
    return `${formattedDate} at ${time}`;
  }
  return formattedDate;
};

// Helper function to sort events by start date
const sortEventsByDate = (events: EventDataForm[]): EventDataForm[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    if (dateA.getTime() === dateB.getTime()) {
      // If dates are same, sort by time
      return (a.startTime || '').localeCompare(b.startTime || '');
    }
    return dateA.getTime() - dateB.getTime();
  });
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit, communityId }) => {
  const [eventMode, setEventMode] = useState<EventMode>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const defaultFormData: EventDataForm = {
    id: Date.now().toString(),
    title: '',
    content: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '10:00',
    location: '',
    contactInfo: '',
    privacy: 'public',
  };

  const [multipleEvents, setMultipleEvents] = useState<EventDataForm[]>([defaultFormData]);
  const [currentEvent, setCurrentEvent] = useState<EventDataForm>(defaultFormData);
  const [richContent, setRichContent] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'internal'>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [durationPreset, setDurationPreset] = useState<'same-day' | '1-week' | '2-weeks' | 'custom'>('same-day');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const addEvent = () => {
    // Save current form data to multiple events list
    const updatedEvents = [...multipleEvents];
    updatedEvents[currentEventIndex] = {
      ...updatedEvents[currentEventIndex],
      title: watch('title'),
      content: richContent,
      startDate: watch('startDate'),
      startTime: watch('startTime'),
      endDate: watch('endDate'),
      endTime: watch('endTime'),
      location: watch('location'),
      contactInfo: watch('contactInfo'),
      privacy: privacy,
    };
    setMultipleEvents(updatedEvents);

    // Create new event
    const newEvent: EventDataForm = {
      id: Date.now().toString(),
      title: '',
      content: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '10:00',
      location: '',
      contactInfo: '',
      privacy: 'public',
    };
    setMultipleEvents([...updatedEvents, newEvent]);
    setCurrentEventIndex(updatedEvents.length);
    setCurrentEvent(newEvent);
    
    // Reset form for new event
    reset({
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '10:00',
      location: '',
      contactInfo: '',
      privacy: 'public',
    });
    
    // Use setTimeout to ensure richContent is cleared after form reset
    setTimeout(() => {
      setRichContent('');
      setPrivacy('public');
    }, 0);
  };

  const switchEvent = (index: number) => {
    // Save current form data to multipleEvents
    const updatedEvents = [...multipleEvents];
    updatedEvents[currentEventIndex] = {
      ...updatedEvents[currentEventIndex],
      title: watch('title'),
      content: richContent,
      startDate: watch('startDate'),
      startTime: watch('startTime'),
      endDate: watch('endDate'),
      endTime: watch('endTime'),
      location: watch('location'),
      contactInfo: watch('contactInfo'),
      privacy: privacy,
    };
    setMultipleEvents(updatedEvents);

    // Load selected event into form
    const selectedEvent = updatedEvents[index];
    reset({
      title: selectedEvent.title,
      startDate: selectedEvent.startDate,
      startTime: selectedEvent.startTime,
      endDate: selectedEvent.endDate,
      endTime: selectedEvent.endTime,
      location: selectedEvent.location,
      contactInfo: selectedEvent.contactInfo,
      privacy: selectedEvent.privacy,
    });
    setCurrentEventIndex(index);
    setCurrentEvent(selectedEvent);
    
    // Use setTimeout to ensure richContent is set after form reset
    setTimeout(() => {
      setRichContent(selectedEvent.content);
      setPrivacy(selectedEvent.privacy);
    }, 0);
  };

  const removeEvent = (index: number) => {
    if (multipleEvents.length > 1) {
      const updatedEvents = multipleEvents.filter((_, i) => i !== index);
      setMultipleEvents(updatedEvents);
      
      let newIndex = currentEventIndex;
      if (currentEventIndex >= updatedEvents.length) {
        newIndex = updatedEvents.length - 1;
      }
      
      const nextEvent = updatedEvents[newIndex];
      setCurrentEventIndex(newIndex);
      setCurrentEvent(nextEvent);
      
      // Reset form with next event's data
      reset({
        title: nextEvent.title,
        startDate: nextEvent.startDate,
        startTime: nextEvent.startTime,
        endDate: nextEvent.endDate,
        endTime: nextEvent.endTime,
        location: nextEvent.location,
        contactInfo: nextEvent.contactInfo,
        privacy: nextEvent.privacy,
      });
      
      // Use setTimeout to ensure richContent is set after form reset
      setTimeout(() => {
        setRichContent(nextEvent.content);
        setPrivacy(nextEvent.privacy);
      }, 0);
    }
  };

  const duplicateEvent = (index: number) => {
    // Save current form data first
    const updatedEvents = [...multipleEvents];
    updatedEvents[currentEventIndex] = {
      ...updatedEvents[currentEventIndex],
      title: watch('title'),
      content: richContent,
      startDate: watch('startDate'),
      startTime: watch('startTime'),
      endDate: watch('endDate'),
      endTime: watch('endTime'),
      location: watch('location'),
      contactInfo: watch('contactInfo'),
      privacy: privacy,
    };

    // Create duplicate of selected event
    const eventToDuplicate = updatedEvents[index];
    const duplicatedEvent: EventDataForm = {
      ...eventToDuplicate,
      id: Date.now().toString(),
      title: `${eventToDuplicate.title} (Copy)`,
    };

    // Insert duplicate right after the original
    updatedEvents.splice(index + 1, 0, duplicatedEvent);
    setMultipleEvents(updatedEvents);

    // Switch to the duplicated event
    setTimeout(() => {
      setCurrentEventIndex(index + 1);
      setCurrentEvent(duplicatedEvent);
      reset({
        title: duplicatedEvent.title,
        startDate: duplicatedEvent.startDate,
        startTime: duplicatedEvent.startTime,
        endDate: duplicatedEvent.endDate,
        endTime: duplicatedEvent.endTime,
        location: duplicatedEvent.location,
        contactInfo: duplicatedEvent.contactInfo,
        privacy: duplicatedEvent.privacy,
      });
      setRichContent(duplicatedEvent.content);
      setPrivacy(duplicatedEvent.privacy);
    }, 0);
  };

  const handleReset = () => {
    reset();
    setEventMode(null);
    setCurrentEventIndex(0);
    setCurrentEvent(defaultFormData);
    setMultipleEvents([defaultFormData]);
    setRichContent('');
    setPrivacy('public');
    onClose();
  };

  const handleFormSubmit: SubmitHandler<EventFormData> = async (data) => {
    setIsLoading(true);
    try {
      if (eventMode === 'multiple') {
        // Save current form data to multipleEvents
        const updatedEvents = [...multipleEvents];
        updatedEvents[currentEventIndex] = {
          ...updatedEvents[currentEventIndex],
          ...data,
          id: updatedEvents[currentEventIndex].id,
          content: richContent,
          privacy,
        };

        // Submit all events
        onSubmit(updatedEvents as EventFormData[]);
      } else {
        // Submit single event
        const eventData = {
          ...data,
          content: richContent,
          privacy,
        };
        onSubmit(eventData);
      }
      handleReset();
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Mode Selection Screen
  if (!eventMode) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col">
          <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                Create Event
              </DialogTitle>
              <button
                onClick={handleReset}
                className="rounded-xl hover:bg-slate-100 p-2 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">How many events do you want to create?</h3>
              <p className="text-slate-500 font-medium">Choose whether to create a single event or multiple events</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
        </DialogContent>
      </Dialog>
    );
  }

  // Event Form Screen
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col">
        <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                Create Event{eventMode === 'multiple' && 's'}
              </DialogTitle>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {eventMode === 'multiple' ? `Event ${currentEventIndex + 1} of ${multipleEvents.length}` : ''}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="rounded-xl hover:bg-slate-100 p-2 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <button
            onClick={() => setEventMode(null)}
            className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-2 mt-4"
          >
            ← Back to Mode Selection
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createEventModal.eventTitle')}
              </label>
              <Input
                id="title"
                placeholder="Enter event title..."
                className={cn(
                  "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 placeholder:text-slate-300 transition-all",
                  errors.title ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                )}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.title.message}
                </p>
              )}
            </div>

            {/* Description Field with Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createEventModal.description')}
              </label>
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                placeholder="Write event description with formatting..."
                minHeight="min-h-[200px]"
              />
              {richContent.replace(/<[^>]*>/g, '').length < 10 && richContent && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> Description must be at least 10 characters
                </p>
              )}
            </div>

            {/* Date and Time Range Section */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
              {/* Header with Calendar Icon */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">{t('createEventModal.eventDates')}</h3>
              </div>

              {/* Quick Duration Presets */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDurationPreset('same-day');
                    const startDate = watch('startDate');
                    setValue('endDate', startDate);
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 uppercase tracking-wider",
                    durationPreset === 'same-day'
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-300"
                  )}
                >
                  Same Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDurationPreset('1-week');
                    const startDate = watch('startDate');
                    setValue('endDate', addDaysToDate(startDate, 7));
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 uppercase tracking-wider",
                    durationPreset === '1-week'
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-300"
                  )}
                >
                  1 Week
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDurationPreset('2-weeks');
                    const startDate = watch('startDate');
                    setValue('endDate', addDaysToDate(startDate, 14));
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 uppercase tracking-wider",
                    durationPreset === '2-weeks'
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-300"
                  )}
                >
                  2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setDurationPreset('custom')}
                  className={cn(
                    "px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 uppercase tracking-wider",
                    durationPreset === 'custom'
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-300"
                  )}
                >
                  Custom
                </button>
              </div>

              {/* Date and Time Inputs Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date and Time */}
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 transition-all",
                      errors.startDate ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                    )}
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="startTime" className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Start Time
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 transition-all",
                      errors.startTime ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                    )}
                    {...register('startTime')}
                  />
                  {errors.startTime && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.startTime.message}
                    </p>
                  )}
                </div>

                {/* End Date and Time */}
                <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 transition-all",
                      errors.endDate ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                    )}
                    {...register('endDate')}
                  />
                  {errors.endDate && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.endDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="endTime" className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    End Time
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 transition-all",
                      errors.endTime ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                    )}
                    {...register('endTime')}
                  />
                  {errors.endTime && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration Display */}
              {watch('startDate') && watch('endDate') && (
                <div className="mt-2 p-3 bg-white rounded-xl border-2 border-teal-200">
                  <p className="text-sm font-bold text-teal-700 text-center">
                    📅 Duration: {calculateDaysDifference(watch('startDate'), watch('endDate'))} day(s)
                  </p>
                </div>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createEventModal.location')}
              </label>
              <Input
                id="location"
                placeholder="Enter event location..."
                className={cn(
                  "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 placeholder:text-slate-300 transition-all",
                  errors.location ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                )}
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.location.message}
                </p>
              )}
            </div>

            {/* Contact Info Field */}
            <div className="space-y-2">
              <label htmlFor="contactInfo" className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createEventModal.contactInfo')}
              </label>
              <Input
                id="contactInfo"
                placeholder="Enter contact information (email or phone)..."
                className={cn(
                  "w-full px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800 placeholder:text-slate-300 transition-all",
                  errors.contactInfo ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-teal-500"
                )}
                {...register('contactInfo')}
              />
              {errors.contactInfo && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.contactInfo.message}
                </p>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                Privacy
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                    privacy === 'public'
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Globe size={18} />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('internal')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                    privacy === 'internal'
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Lock size={18} />
                  Internal
                </button>
              </div>
            </div>

            {/* Multiple Events List */}
            {eventMode === 'multiple' && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase">
                    Event {currentEventIndex + 1} | {watch('title') || '(Untitled)'}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">({multipleEvents.length} events)</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortEventsByDate(multipleEvents).map((event, idx) => {
                    // Find original index in unsorted array
                    const originalIndex = multipleEvents.findIndex(e => e.id === event.id);
                    return (
                    <div
                      key={event.id}
                      onClick={() => switchEvent(originalIndex)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        currentEventIndex === originalIndex
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{event.title || `Event ${originalIndex + 1}`}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatEventDateTime(event.startDate, event.startTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateEvent(originalIndex);
                        }}
                        className="ml-2 px-2 py-1 text-xs text-teal-600 hover:bg-teal-50 rounded-lg"
                        variant="ghost"
                        title="Duplicate for recurring events"
                      >
                        <Copy size={14} />
                      </Button>
                      {multipleEvents.length > 1 && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEvent(originalIndex);
                          }}
                          className="ml-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>

        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end shrink-0">
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              className="px-6 py-3 rounded-xl font-black text-slate-700 border-slate-300 hover:bg-slate-100 transition-all"
              disabled={isLoading}
            >
              {t('createEventModal.cancel')}
            </Button>
            {eventMode === 'multiple' && (
              <Button
                type="button"
                onClick={addEvent}
                disabled={isLoading}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black flex items-center gap-2"
              >
                <Plus size={18} />
                Add Event
              </Button>
            )}
            <Button
              type="submit"
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
              disabled={isLoading || richContent.replace(/<[^>]*>/g, '').length < 10}
            >
              {isLoading ? 'Creating...' : eventMode === 'multiple' ? `Create ${multipleEvents.length} Events` : t('createEventModal.submit')}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
