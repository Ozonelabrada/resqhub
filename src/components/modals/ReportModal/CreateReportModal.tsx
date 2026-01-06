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
  Select,
  Alert
} from '../../ui';
import { 
  FileText, 
  MapPin, 
  Tag, 
  Info, 
  DollarSign, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Upload, 
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ReportsService } from '../../../services/reportsService';
import { CategoryService } from '../../../services/categoryService';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ label: string, value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 0,
    location: '',
    contactInfo: '',
    rewardDetails: '',
    reportType: 1
  });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats.map(c => ({ label: c.name, value: Number(c.id) })));
      if (cats.length > 0 && formData.categoryId === 0) {
        setFormData(prev => ({ ...prev, categoryId: Number(cats[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError('You must be logged in to create a report.');
        return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      userId: String(user.id),
      // In a real app, you might upload images to S3 first, but here we follow instructions
      // and send JSON. Sending base64 strings in an array is a common way for simple demos.
      images: images 
    };

    const result = await ReportsService.createReport(payload);
    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].value : 0,
        location: '',
        contactInfo: '',
        rewardDetails: '',
        reportType: 1
      });
      setImages([]);
    } else {
      setError(result.message || 'Failed to create report');
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-[2.5rem] p-0">
        <div className="p-8 md:p-10 space-y-8">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
                <FileText size={24} />
              </div>
              <span>Create New Report</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-lg pt-2">
              Provide details about the item to help the community.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="error" className="rounded-2xl border-orange-100 bg-orange-50 text-orange-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" />
                {error}
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  Report Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('reportType', 1)}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.reportType === 1 
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-teal-200'
                    }`}
                  >
                    Lost Item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('reportType', 2)}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.reportType === 2 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                    }`}
                  >
                    Found Item
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-slate-700">Item Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Lost Golden Retriever, Found Blue Wallet"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <Select
                  value={formData.categoryId}
                  options={categories}
                  onChange={(val) => handleInputChange('categoryId', Number(val))}
                  placeholder="Select category"
                  className="rounded-2xl border-slate-100 bg-slate-50"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Neighborhood"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the item, including identifying features..."
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600 min-h-[120px]"
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Contact Info
                </label>
                <Input
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Phone or Email"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>

              {/* Reward */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Reward Details
                </label>
                <Input
                  value={formData.rewardDetails}
                  onChange={(e) => handleInputChange('rewardDetails', e.target.value)}
                  placeholder="Optional reward (e.g., $50)"
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-teal-600"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                Images (Optional)
              </label>
              
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 group">
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
                {images.length < 4 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-teal-600 hover:border-teal-200">
                    <Upload size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold text-lg"
              >
                Publish Report
                <ShieldCheck className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
