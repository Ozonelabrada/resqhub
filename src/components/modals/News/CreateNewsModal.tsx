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
import { Upload, X, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/common/RichTextEditor/RichTextEditor';

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  content: z.string().min(1, 'Content is required').min(10, 'Content must be at least 10 characters'),
  image: z.string().optional(),
  privacy: z.enum(['public', 'internal']),
});

export type NewsFormData = z.infer<typeof newsSchema>;

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewsFormData) => void;
  communityId: string;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({ isOpen, onClose, onSubmit, communityId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [richContent, setRichContent] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'internal'>('public');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
  };

  const handleFormSubmit: SubmitHandler<NewsFormData> = async (data) => {
    setIsLoading(true);
    try {
      const newsData = {
        ...data,
        content: richContent,
        image: imagePreview,
        privacy,
      };
      onSubmit(newsData);
      reset();
      setImagePreview('');
      setRichContent('');
      setPrivacy('public');
      onClose();
    } catch (error) {
      console.error('Error submitting news:', error);
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
              {t('createNewsModal.title')}
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
                {t('createNewsModal.newsTitle')}
              </label>
              <Input
                id="title"
                placeholder="Enter news title..."
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
                {t('createNewsModal.content')}
              </label>
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                placeholder="Write your news content here with formatting..."
                minHeight="min-h-[250px]"
              />
              {richContent.replace(/<[^>]*>/g, '').length < 10 && richContent && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <span>⚠</span> Content must be at least 10 characters
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                {t('createNewsModal.image')}
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-teal-500 hover:bg-teal-50 transition-all group">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <Upload size={24} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-700 text-sm">Click to upload image</p>
                        <p className="text-xs text-slate-400 font-semibold">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
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
              {t('createNewsModal.cancel')}
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
              disabled={isLoading || richContent.replace(/<[^>]*>/g, '').length < 10}
            >
              {isLoading ? 'Publishing...' : t('createNewsModal.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
