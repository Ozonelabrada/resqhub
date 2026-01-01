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

interface ReportModalProps {
  visible: boolean;
  onHide: () => void;
  reportType: 'lost' | 'found';
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reward: string;
  images: File[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onHide,
  reportType,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    reward: '',
    images: []
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats.map((cat: any) => ({
        label: cat.name,
        value: cat.name
      })));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: any) => {
    setFormData(prev => ({ ...prev, images: e.files }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast?.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        type: reportType,
        contactInfo: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        reward: formData.reward || undefined,
        images: formData.images // Handle images separately if needed
      };

      await ItemsService.createReport(reportData);

      toast?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Your ${reportType} report has been submitted successfully!`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        reward: '',
        images: []
      });

      onHide();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create report:', error);
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit report. Please try again.'
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
                value={formData.category}
                options={categories}
                onChange={(e) => handleInputChange('category', e.value)}
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
              <label htmlFor="contactName" className="block text-900 font-medium mb-2">
                Contact Name
              </label>
              <InputText
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Your name"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="contactPhone" className="block text-900 font-medium mb-2">
                Contact Phone
              </label>
              <InputText
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Your phone number"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="contactEmail" className="block text-900 font-medium mb-2">
                Contact Email
              </label>
              <InputText
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Your email address"
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