import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Button, 
  Input, 
  Textarea,
} from '@/components/ui';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from 'i18next';
import { Upload, X, Clock, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// replaced rich editor with simple textarea plus minimal markdown support
// (bold **text** and newline preservation) for easier content management


const newsItemSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  content: z.string().min(1, 'Content is required').min(10, 'Content must be at least 10 characters'),
  // summary removed – backend will use content for this field
  category: z.string().min(1, 'Category is required'),
  // author is assigned automatically; not part of form validation
  imageUrl: z.string().optional(),
  publishDate: z.string().min(1, 'Publish date is required'),
  isFeatured: z.boolean(),
  privacy: z.enum(['public', 'internal']),
  sourceUrl: z.string().optional(),
});

const newsSchema = z.object({
  newsArticles: z.array(newsItemSchema).min(1, 'At least one news article is required'),
  sendNotifications: z.boolean(),
  notificationMessage: z.string().optional(),
});

export type NewsFormData = z.infer<typeof newsSchema>;
export type NewsItemData = z.infer<typeof newsItemSchema>;

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewsFormData) => void;
  communityId: string;
}

function getDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({ isOpen, onClose, onSubmit, communityId }) => {
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    register,
    setValue,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    mode: 'onChange',
    defaultValues: {
      newsArticles: [
        {
          title: '',
          content: '',
          category: '',
          publishDate: getDefaultDate(),
          isFeatured: false,
          privacy: 'public',
        },
      ],
      sendNotifications: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'newsArticles',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [contents, setContents] = useState<string[]>(['']);
  const [imagePreviews, setImagePreviews] = useState<string[]>(['']);
  const sendNotifications = watch('sendNotifications');

  useEffect(() => {
    if (!isOpen) {
      reset();
      setContents(['']);
      setImagePreviews(['']);
    }
  }, [isOpen, reset]);

  const handleAddNews = () => {
    append({
      title: '',
      content: '',
      category: '',
      publishDate: getDefaultDate(),
      isFeatured: false,
      privacy: 'public',
    });
    setContents([...contents, '']);
    setImagePreviews([...imagePreviews, '']);
  };

  const handleRemoveNews = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setContents(contents.filter((_, i) => i !== index));
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    }
  };

  const handleContentChange = (index: number, value: string) => {
    const newContents = [...contents];
    newContents[index] = value;
    setContents(newContents);
    // keep react-hook-form in sync so zod validation for `content` passes
    setValue(`newsArticles.${index}.content`, value.trim(), { shouldValidate: true, shouldDirty: true });
  };



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newImagePreviews = [...imagePreviews];
        newImagePreviews[index] = result;
        setImagePreviews(newImagePreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImagePreviews = [...imagePreviews];
    newImagePreviews[index] = '';
    setImagePreviews(newImagePreviews);
  };

  const handleFormSubmit: SubmitHandler<NewsFormData> = async (data) => {
    console.log('CreateNewsModal.handleFormSubmit called', data);
    setIsLoading(true);

    const newsData = {
      ...data,
      newsArticles: data.newsArticles.map((article, idx) => ({
        ...article,
        author: user?.fullName || user?.username || 'Unknown',
        content: contents[idx],
        summary: contents[idx], // backend expects summary field; use content as summary
        imageUrl: imagePreviews[idx] || undefined,
        publishDate: article.publishDate ? new Date(article.publishDate).toISOString() : new Date().toISOString(),
      })),
    };

    try {
      let result: any = undefined;
      if (onSubmit) {
        result = await onSubmit(newsData);
      }

      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          throw new Error(result.message || 'Failed to save news');
        }
      }

      const toast = (window as any).showToast;
      if (toast) {
        toast('success', 'News Created', `Published ${newsData.newsArticles.length} article${newsData.newsArticles.length !== 1 ? 's' : ''}`);
      }

      // close only after successful result
      onClose();
      reset();
    } catch (error) {
      console.error('Error submitting news:', error);
      const toast = (window as any).showToast;
      if (toast) {
        toast('error', 'Publish Failed', (error as any)?.message || 'Failed to create news');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // avoid closing the dialog while a save is in progress
        if (!open && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white max-h-[95vh]">
        <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              Create News Articles
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-xl hover:bg-slate-100 p-2 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <p className="text-sm text-slate-500 font-semibold mt-2">Create and schedule multiple news articles at once</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto max-h-[calc(95vh-240px)]">
          <div className="px-8 py-6 space-y-6">
            {/* News Articles List */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-6 border-2 border-slate-200 rounded-2xl space-y-4 bg-slate-50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">Article {index + 1}</h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNews(index)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Remove article"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Article Title*
                      </label>
                      <Input
                        placeholder="e.g., Community Initiative Success"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`newsArticles.${index}.title`)}
                      />
                      {errors.newsArticles?.[index]?.title && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.newsArticles[index]?.title?.message}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Category*
                      </label>
                      <Input
                        placeholder="e.g., Announcements"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`newsArticles.${index}.category`)}
                      />
                      {errors.newsArticles?.[index]?.category && (
                        <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.newsArticles[index]?.category?.message}</p>
                      )}
                    </div>


                    {/* Publish Date */}
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        <Clock size={14} className="inline mr-1" />
                        Publish Date*
                      </label>
                      <Input
                        type="date"
                        className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                        {...register(`newsArticles.${index}.publishDate`)}
                      />
                    </div>

                    {/* Privacy & Featured */}
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                        Privacy Level*
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setValue(`newsArticles.${index}.privacy`, 'public')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                            watch(`newsArticles.${index}.privacy`) === 'public'
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <Globe size={16} />
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue(`newsArticles.${index}.privacy`, 'internal')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-black transition-all",
                            watch(`newsArticles.${index}.privacy`) === 'internal'
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <Lock size={16} />
                          Internal
                        </button>
                      </div>
                      <input type="hidden" {...register(`newsArticles.${index}.privacy`)} />
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                      <input
                        type="checkbox"
                        id={`featured-${index}`}
                        className="w-5 h-5 rounded text-yellow-600"
                        {...register(`newsArticles.${index}.isFeatured`)}
                      />
                      <label htmlFor={`featured-${index}`} className="font-black text-slate-700 text-sm uppercase tracking-wider cursor-pointer">
                        Mark as Featured
                      </label>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                      Article Content*
                    </label>
                    <Textarea
                      value={contents[index]}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      placeholder="Write article content...\nUse **bold** for emphasis"
                      className="min-h-[150px] px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                    />
                    {errors.newsArticles?.[index]?.content && (
                      <p className="text-xs font-bold text-red-500 mt-1">⚠ {errors.newsArticles[index]?.content?.message}</p>
                    )}
                    {contents[index].trim().length < 10 && (
                      <p className="text-xs font-bold text-red-500 mt-1">⚠ Content must be at least 10 characters</p>
                    )}
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                      Featured Image (Optional)
                    </label>
                    {imagePreviews[index] ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group">
                        <img src={imagePreviews[index]} alt="Preview" className="w-full h-48 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-all group">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Upload size={20} className="text-teal-600" />
                            <div>
                              <p className="font-black text-slate-700 text-sm">Click to upload image</p>
                              <p className="text-xs text-slate-400 font-semibold">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Source URL */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                      Source URL (Optional)
                    </label>
                    <Input
                      placeholder="https://example.com"
                      className="px-4 py-3 rounded-2xl border-2 bg-white font-semibold text-slate-800"
                      {...register(`newsArticles.${index}.sourceUrl`)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add News Button */}
            <button
              type="button"
              onClick={handleAddNews}
              className="w-full py-3 border-2 border-dashed border-teal-300 rounded-2xl text-teal-600 font-black hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Article
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
              disabled={isLoading || !isValid || contents.some(c => c.trim().length < 10)}
            >
              {isLoading ? 'Publishing...' : `Publish ${fields.length} Article${fields.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewsModal;
