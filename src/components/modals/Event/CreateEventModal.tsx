import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Button, 
  Input,
} from '@/components/ui';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from 'i18next';
import { X, Clock, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/common/RichTextEditor/RichTextEditor';

const eventItemSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required').min(3, 'Location must be at least 3 characters'),
  contactInfo: z.string().min(1, 'Contact info is required').min(3, 'Contact info must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
  maxAttendees: z.number().int().positive('Max attendees must be positive').optional(),
  publishDate: z.string().min(1, 'Publish date is required'),
  privacy: z.enum(['public', 'internal']),
});

const eventSchema = z.object({
  events: z.array(eventItemSchema).min(1, 'At least one event is required'),
  sendNotifications: z.boolean(),
  notificationMessage: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type EventItemData = z.infer<typeof eventItemSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  communityId: string;
}

function getDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit, communityId }) => {
  const {
    control, 
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    register,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      events: [
        {
          title: '',
          description: '',
          startDate: getDefaultDate(),
          endDate: getDefaultDate(),
          location: '',
          contactInfo: '',
          category: '',
          publishDate: getDefaultDate(),
          privacy: 'public',
        },
      ],
      sendNotifications: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'events',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>(['']);
  const sendNotifications = watch('sendNotifications');

  useEffect(() => {
    if (!isOpen) {
      reset();
      setDescriptions(['']);
    }
  }, [isOpen, reset]);

  const handleAddEvent = () => {
    append({
      title: '',
      description: '',
      startDate: getDefaultDate(),
      endDate: getDefaultDate(),
      location: '',
      contactInfo: '',
      category: '',
      publishDate: getDefaultDate(),
      privacy: 'public',
    });
    setDescriptions([...descriptions, '']);
  };

  const handleRemoveEvent = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setDescriptions(descriptions.filter((_, i) => i !== index));
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleFormSubmit: SubmitHandler<EventFormData> = async (data) => {
    setIsLoading(true);
    try {
      const eventData = {
        ...data,
        events: data.events.map((event, idx) => ({
          ...event,
          description: descriptions[idx],
        })),
      };
      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Error submitting events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[95vh]">
        <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              Create Multiple Events
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-xl hover:bg-slate-100 p-2 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <p className="text-sm text-slate-500 font-semibold mt-2">Create and schedule multiple events at once</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto max-h-[calc(95vh-240px)]">
          <div className="px-8 py-6 space-y-6">
            {/* Events List */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-6 border-2 border-slate-200 rounded-2xl space-y-4 bg-slate-50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">Event {index + 1}</h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(index)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Remove event"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Event Title*
                      </label>
                      <Input
                        placeholder="e.g., Community Cleanup"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.title`)}
                      />
                      {errors.events?.[index]?.title && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.events[index]?.title?.message}</p>
                      )}
                    </div>

                    {/* Location & Category */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Location*
                      </label>
                      <Input
                        placeholder="Event location..."
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.location`)}
                      />
                      {errors.events?.[index]?.location && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.events[index]?.location?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Category*
                      </label>
                      <Input
                        placeholder="e.g., Sports, Workshop"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.category`)}
                      />
                      {errors.events?.[index]?.category && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.events[index]?.category?.message}</p>
                      )}
                    </div>

                    {/* Contact & Max Attendees */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Contact Info*
                      </label>
                      <Input
                        placeholder="Phone or email..."
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.contactInfo`)}
                      />
                      {errors.events?.[index]?.contactInfo && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.events[index]?.contactInfo?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Max Attendees (Optional)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.maxAttendees`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Dates */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Start Date*
                      </label>
                      <Input
                        type="date"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.startDate`)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        End Date*
                      </label>
                      <Input
                        type="date"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.endDate`)}
                      />
                    </div>

                    {/* Publish Date & Privacy */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        <Clock size={14} className="inline mr-1" />
                        Publish Date*
                      </label>
                      <Input
                        type="date"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`events.${index}.publishDate`)}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Privacy Level*
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setValue(`events.${index}.privacy`, 'public')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                            watch(`events.${index}.privacy`) === 'public'
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <Globe size={16} />
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue(`events.${index}.privacy`, 'internal')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                            watch(`events.${index}.privacy`) === 'internal'
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <Lock size={16} />
                          Internal
                        </button>
                      </div>
                      <input type="hidden" {...register(`events.${index}.privacy`)} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                      Description*
                    </label>
                    <RichTextEditor
                      value={descriptions[index]}
                      onChange={(value) => handleDescriptionChange(index, value)}
                      placeholder="Event description..."
                      minHeight="min-h-[120px]"
                    />
                    {descriptions[index].replace(/<[^>]*>/g, '').length < 10 && (
                      <p className="text-xs font-bold text-red-500 mt-1">⚠ Description must be at least 10 characters</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Event Button */}
            <button
              type="button"
              onClick={handleAddEvent}
              className="w-full py-3 border-2 border-dashed border-teal-300 rounded-2xl text-teal-600 font-black hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Event
            </button>

            {/* Notifications Section */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('sendNotifications')}
                  className="w-5 h-5 rounded text-teal-600"
                />
                <span className="font-black text-slate-700 uppercase tracking-wider">Send Notifications to Members</span>
              </label>
              {sendNotifications && (
                <Input
                  placeholder="Optional notification message..."
                  className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                  {...register('notificationMessage')}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end sticky bottom-0">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6 py-3 rounded-xl font-black text-slate-700 border-slate-300 hover:bg-slate-100 transition-all"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
              disabled={isLoading || !isValid || descriptions.some(d => d.replace(/<[^>]*>/g, '').length < 10)}
            >
              {isLoading ? 'Creating...' : `Create ${fields.length} Event${fields.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
