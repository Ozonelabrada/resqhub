import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Spinner,
  Alert,
  Toast
} from '../../ui';
import { 
  Camera, 
  MapPin, 
  Tag, 
  Info, 
  DollarSign, 
  Phone, 
  X, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { ItemsService } from '../../../services/itemsService';
import { CategoryService } from '../../../services/categoryService';
import { useAuth } from '../../../context/AuthContext';
import { getGeolocation, type GeolocationData } from '../../../utils/geolocation';
import { sanitizeInput } from '../../../utils/validation';

interface ReportModalProps {
  visible: boolean;
  onHide: () => void;
  reportType: 'lost' | 'found';
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  categoryId: number | null;
  location: string;
  contactInfo: string;
  reward: string;
  images: File[];
  geolocation?: GeolocationData;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onHide,
  reportType,
  onSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categoryId: null,
    location: '',
    contactInfo: '',
    reward: '',
    images: []
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadCategories();
      handleGetLocation();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats.map((cat: any) => ({
        label: cat.name,
        value: cat.id
      })));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleGetLocation = async () => {
    try {
      const geo = await getGeolocation();
      setFormData(prev => ({ ...prev, geolocation: geo }));
      if (geo.city && !formData.location) {
        setFormData(prev => ({ ...prev, location: `${geo.city}, ${geo.state}, ${geo.country}` }));
      }
    } catch (error) {
      console.warn('Failed to get geolocation:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: any) => {
    const files = e.files;
    // Validation: Max 5 images, max 2MB each
    if (files.length > 5) {
      toast?.show({
        severity: 'warn',
        summary: 'Validation Warning',
        detail: 'You can only upload up to 5 images'
      });
      return;
    }
    
    const validFiles = Array.from(files).filter((file: any) => file.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast?.show({
        severity: 'warn',
        summary: 'Validation Warning',
        detail: 'Some images were skipped because they exceed 2MB'
      });
    }

    setFormData(prev => ({ ...prev, images: validFiles as File[] }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.categoryId || !formData.location || !formData.contactInfo) {
      toast?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);
    try {
      const reportPayload = {
        userId: user?.id,
        categoryId: formData.categoryId,
        title: sanitizeInput(formData.title),
        description: formData.description,
        location: sanitizeInput(formData.location),
        contactInfo: formData.contactInfo,
        rewardDetails: sanitizeInput(formData.reward),
        reportType: reportType === 'lost' ? 1 : 2,
        latitude: formData.geolocation?.latitude || 0,
        longitude: formData.geolocation?.longitude || 0,
        city: sanitizeInput(formData.geolocation?.city || ''),
        state: sanitizeInput(formData.geolocation?.state || ''),
        country: sanitizeInput(formData.geolocation?.country || '')
      };

      const response = await ItemsService.createReport(reportPayload);
      const reportId = response.data?.id;

      // Upload images if any
      if (reportId && formData.images.length > 0) {
        await Promise.all(formData.images.map(image => 
          ItemsService.uploadReportImage(image, reportId)
        ));
      }

      toast?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Your ${reportType} report has been submitted successfully!`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: null,
        location: '',
        contactInfo: '',
        reward: '',
        images: []
      });

      onHide();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create report:', error);
      toast?.show({
        severity: 'error',
        summary: 'Error',
        detail: error?.response?.data?.message || 'Failed to submit report. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={visible} 
      onClose={onHide} 
      title={`Report ${reportType === 'lost' ? 'Lost' : 'Found'} Item`}
      size="lg"
    >
      <Toast ref={setToast} />
      
      <ModalBody className="p-6 md:p-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner size="xl" variant="primary" />
            <p className="text-slate-500 animate-pulse">Submitting your report...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-500" />
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your report"
                className="rounded-2xl"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                Description *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the item"
                rows={4}
                className="rounded-2xl shadow-sm focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Category *
              </label>
              <Select
                id="category"
                value={formData.categoryId?.toString() || ''}
                options={categories.map(cat => ({ label: cat.label, value: String(cat.value || '') }))}
                onChange={(value) => handleInputChange('categoryId', parseInt(value))}
                placeholder="Select a category"
                className="rounded-2xl shadow-sm focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Location *
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where was the item lost/found?"
                className="rounded-2xl shadow-sm focus:ring-orange-600 focus:border-orange-600"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="contactInfo" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" />
                Contact Information *
              </label>
              <Textarea
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder="How can people reach you? (e.g., Name, Phone, Email)"
                rows={2}
                className="rounded-2xl shadow-sm focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reward" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-600" />
                Reward (Optional)
              </label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="Any reward offered?"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                Images (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      handleFileSelect({ files: Array.from(files) });
                    }
                  }}
                  className="hidden"
                />
                <label 
                  htmlFor="images"
                  className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all cursor-pointer text-slate-500"
                >
                  <Upload className="w-5 h-5" />
                  <span>{formData.images.length > 0 ? `${formData.images.length} images selected` : 'Choose Images'}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="bg-slate-50/50 p-6 flex justify-end gap-4">
        <Button 
          variant="ghost" 
          onClick={onHide}
          disabled={loading}
          className="rounded-xl px-6 font-bold"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          loading={loading}
          className="rounded-xl px-8 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 font-bold transition-all active:scale-95"
        >
          Submit Report
        </Button>
      </ModalFooter>
    </Modal>
  );
};