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
import { X, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/common/RichTextEditor/RichTextEditor';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  content: z.string().min(1, 'Content is required').min(10, 'Content must be at least 10 characters'),
  privacy: z.enum(['public', 'internal']),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnnouncementFormData) => void;
  communityId: string;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ isOpen, onClose, onSubmit, communityId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [richContent, setRichContent] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'internal'>('public');

  const handleFormSubmit: SubmitHandler<AnnouncementFormData> = async (data) => {
    setIsLoading(true);
    try {
      const announcementData = {
        ...data,
        content: richContent,
        privacy,
      };
      onSubmit(announcementData);
      reset();
      setRichContent('');
      setPrivacy('public');
      onClose();
    } catch (error) {
      console.error('Error submitting announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[95vh]">
        <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              {t('createAnnouncementModal.title')}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-xl hover:bg-slate-100 p-2 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="px-8 py-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createAnnouncementModal.announcementTitle')}
              </label>
              <Input
                id="title"
                placeholder="Enter announcement title..."
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

            {/* Rich Text Content Field */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createAnnouncementModal.content')}
              </label>
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                placeholder="Write your announcement content here with formatting..."
                minHeight="min-h-[250px]"
              />
              {richContent.replace(/<[^>]*>/g, '').length < 10 && richContent && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> Content must be at least 10 characters
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
              {t('createAnnouncementModal.cancel')}
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
              disabled={isLoading || richContent.replace(/<[^>]*>/g, '').length < 10}
            >
              {isLoading ? 'Publishing...' : t('createAnnouncementModal.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
