import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

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
      toast?.current?.show({
        severity: 'warn',
        summary: 'Validation Warning',
        detail: 'You can only upload up to 5 images'
      });
      return;
    }
    
    const validFiles = Array.from(files).filter((file: any) => file.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast?.current?.show({
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
      toast?.current?.show({
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
        description: sanitizeInput(formData.description),
        location: sanitizeInput(formData.location),
        contactInfo: sanitizeInput(formData.contactInfo),
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

      toast?.current?.show({
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
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error?.response?.data?.message || 'Failed to submit report. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Submit Report"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
        className="p-button-primary"
      />
    </div>
  );

  return (
    <>
      <Toast ref={setToast} />
      <Dialog
        header={`Report ${reportType === 'lost' ? 'Lost' : 'Found'} Item`}
        visible={visible}
        onHide={onHide}
        style={{ width: '600px' }}
        footer={footer}
        modal
        closable={!loading}
      >
        {loading ? (
          <div className="flex flex-column align-items-center p-4">
            <ProgressSpinner />
            <p className="mt-3">Submitting your report...</p>
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            <div className="field">
              <label htmlFor="title" className="block text-900 font-medium mb-2">
                Title *
              </label>
              <InputText
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your report"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="description" className="block text-900 font-medium mb-2">
                Description *
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the item"
                rows={4}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="category" className="block text-900 font-medium mb-2">
                Category *
              </label>
              <Dropdown
                id="category"
                value={formData.categoryId}
                options={categories}
                onChange={(e) => handleInputChange('categoryId', e.value)}
                placeholder="Select a category"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="location" className="block text-900 font-medium mb-2">
                Location *
              </label>
              <InputText
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where was the item lost/found?"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="contactInfo" className="block text-900 font-medium mb-2">
                Contact Information *
              </label>
              <InputTextarea
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder="How can people reach you? (e.g., Name, Phone, Email)"
                rows={2}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="reward" className="block text-900 font-medium mb-2">
                Reward (Optional)
              </label>
              <InputText
                id="reward"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="Any reward offered?"
                className="w-full"
              />
            </div>

            <div className="field">
              <label className="block text-900 font-medium mb-2">
                Images (Optional)
              </label>
              <FileUpload
                mode="basic"
                accept="image/*"
                maxFileSize={1000000}
                onSelect={handleFileSelect}
                chooseLabel="Choose Images"
                multiple
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};