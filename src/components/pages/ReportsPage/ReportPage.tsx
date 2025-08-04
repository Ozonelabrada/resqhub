import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { Steps } from 'primereact/steps';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { RadioButton } from 'primereact/radiobutton';
import { SelectButton } from 'primereact/selectbutton';
import { ItemsService } from '../../../services/itemsService';
import mapFormDataToApiPayload from '../../../utils/mapFormDataToApiPayload';
const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Form data that adapts to report type
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    currentLocation: '', // For found items only
    date: null as Date | null,
    time: '',
    condition: 'good', // For found items only
    contactInfo: {
      name: '',
      phone: '',
      email: '',
      preferredContact: 'phone'
    },
    handoverPreference: 'meet', // For found items only
    additionalInfo: {
      reward: '', // For lost items only
      circumstances: '',
      identifyingFeatures: '',
      storageLocation: '' // For found items only
    },
    images: [] as File[]
  });

  // Check authentication and get report type from URL
  useEffect(() => {
    const token = localStorage.getItem('publicUserToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Get type from URL params if provided
    const type = searchParams.get('type');
    if (type === 'lost' || type === 'found') {
      setReportType(type);
    }

    // Auto-fill user data if available
    const userData = localStorage.getItem('publicUserData');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          name: user.name || '',
          email: user.email || ''
        }
      }));
    }
  }, [searchParams, navigate]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const reportTypeOptions = [
    { label: 'Lost Item', value: 'lost', icon: 'pi pi-minus-circle' },
    { label: 'Found Item', value: 'found', icon: 'pi pi-plus-circle' }
  ];

  const categories = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Keys', value: 'Keys' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Documents', value: 'Documents' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Bags & Wallets', value: 'Bags & Wallets' },
    { label: 'Pets', value: 'Pets' },
    { label: 'Vehicles', value: 'Vehicles' },
    { label: 'Other', value: 'Other' }
  ];

  const conditionOptions = [
    { label: 'Excellent', value: 'excellent', color: 'success' },
    { label: 'Good', value: 'good', color: 'info' },
    { label: 'Fair', value: 'fair', color: 'warning' },
    { label: 'Damaged', value: 'damaged', color: 'danger' }
  ];

  const handoverOptions = [
    { label: 'Meet in person', value: 'meet' },
    { label: 'Pickup from my location', value: 'pickup' },
    { label: 'Mail/Ship to owner', value: 'mail' }
  ];

  const contactMethods = [
    { label: 'Phone', value: 'phone' },
    { label: 'Email', value: 'email' },
    { label: 'Both', value: 'both' }
  ];

  const steps = [
    { label: 'Report Type' },
    { label: 'Item Details' },
    { label: 'Location & Info' },
    { label: 'Contact & Submit' }
  ];

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return reportType !== null;
      case 1:
        return formData.title && formData.category && formData.description && formData.description.length >= 10;
      case 2:
        if (reportType === 'lost') {
          return formData.location && formData.date;
        } else {
          return formData.location && formData.currentLocation && formData.date && formData.condition;
        }
      case 3:
        return formData.contactInfo.name && 
               (formData.contactInfo.phone || formData.contactInfo.email);
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleImageUpload = (event: any) => {
    const files = Array.from(event.files) as File[];
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

 const handleSubmit = async () => {
  if (!validateStep(currentStep)) return;
  
  setIsSubmitting(true);

  try {
    const reportData = mapFormDataToApiPayload(reportType, formData);
    // Call the API to save the report
    await ItemsService.createReport(reportData);

    // Navigate to success page
    navigate('/');
  } catch (error) {
    console.error('Error submitting report:', error);
    Message.error('Failed to submit report. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleReportTypeChange = (newType: 'lost' | 'found') => {
    setReportType(newType);
    // Reset certain fields when switching types
    setFormData(prev => ({
      ...prev,
      currentLocation: '',
      condition: 'good',
      handoverPreference: 'meet',
      additionalInfo: {
        ...prev.additionalInfo,
        reward: '',
        storageLocation: ''
      }
    }));
  };

  const renderReportTypeStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          What would you like to report?
        </h2>
        <p className="text-gray-600">
          Select the type of report you want to create
        </p>
      </div>
      
      <div className="flex justify-content-center">
        <SelectButton
          value={reportType}
          onChange={(e) => handleReportTypeChange(e.value)}
          options={reportTypeOptions}
          optionLabel="label"
          className="custom-selectbutton"
        />
      </div>

      <div className="text-center mt-4">
        <div className={`p-4 border-round ${reportType === 'lost' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className={`text-4xl mb-3 ${reportType === 'lost' ? 'text-red-600' : 'text-green-600'}`}>
            {reportType === 'lost' ? '🔍' : '🎯'}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${reportType === 'lost' ? 'text-red-800' : 'text-green-800'}`}>
            {reportType === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
          </h3>
          <p className={`text-sm ${reportType === 'lost' ? 'text-red-700' : 'text-green-700'}`}>
            {reportType === 'lost' 
              ? "Help us help you find your missing item by providing detailed information."
              : "Help reunite someone with their lost item by reporting what you found."
            }
          </p>
        </div>
      </div>
    </div>
  );

  const renderItemDetailsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Item Details</h3>
        <p className="text-gray-600">
          Provide detailed information about the {reportType === 'lost' ? 'lost' : 'found'} item
        </p>
      </div>

      <div className="grid">
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What {reportType === 'lost' ? 'did you lose' : 'did you find'}? *
          </label>
          <InputText
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="e.g., iPhone 14, Blue Wallet, Set of Keys..."
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <Dropdown
            value={formData.category}
            options={categories}
            onChange={(e) => updateFormData('category', e.value)}
            placeholder="Select a category"
            className="w-full"
          />
        </div>

        {/* Show condition for found items */}
        {reportType === 'found' && (
          <div className="col-12 md:col-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item condition *
            </label>
            <Dropdown
              value={formData.condition}
              options={conditionOptions}
              onChange={(e) => updateFormData('condition', e.value)}
              optionLabel="label"
              optionValue="value"
              className="w-full"
            />
          </div>
        )}
        
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description * (minimum 10 characters)
          </label>
          <InputTextarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Provide detailed description including color, brand, size, distinctive features..."
            rows={4}
            className="w-full"
          />
          <small className="text-gray-500">
            {formData.description.length}/500 characters (minimum 10)
          </small>
        </div>

        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identifying Features
          </label>
          <InputTextarea
            value={formData.additionalInfo.identifyingFeatures}
            onChange={(e) => updateFormData('additionalInfo.identifyingFeatures', e.target.value)}
            placeholder="Any unique marks, scratches, stickers, engravings, or distinctive features..."
            rows={3}
            className="w-full"
          />
        </div>

        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional - Max 5)
          </label>
          <FileUpload
            mode="basic"
            name="photos"
            accept="image/*"
            maxFileSize={5000000}
            multiple
            onSelect={handleImageUpload}
            chooseLabel="Add Photos"
            className="w-full"
          />
          
          {formData.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-4rem h-4rem object-cover border-round"
                  />
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm absolute -top-2 -right-2"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                    onClick={() => removeImage(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLocationInfoStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Location & Date Information</h3>
        <p className="text-gray-600">
          Help others locate the item with precise details
        </p>
      </div>

      <div className="grid">
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {reportType === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'} *
          </label>
          <InputText
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="e.g., Main Street Park, City Mall Food Court..."
            className="w-full"
          />
        </div>

        {/* Show current location for found items */}
        {reportType === 'found' && (
          <div className="col-12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where is it now? *
            </label>
            <InputText
              value={formData.currentLocation}
              onChange={(e) => updateFormData('currentLocation', e.target.value)}
              placeholder="e.g., My home, Office security desk..."
              className="w-full"
            />
          </div>
        )}
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date {reportType === 'lost' ? 'lost' : 'found'} *
          </label>
          <Calendar
            value={formData.date}
            onChange={(e) => updateFormData('date', e.value)}
            placeholder="Select date"
            className="w-full"
            maxDate={new Date()}
            showIcon
          />
        </div>
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time (optional)
          </label>
          <InputText
            value={formData.time}
            onChange={(e) => updateFormData('time', e.target.value)}
            placeholder="e.g., 2:30 PM"
            className="w-full"
          />
        </div>
        
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Circumstances
          </label>
          <InputTextarea
            value={formData.additionalInfo.circumstances}
            onChange={(e) => updateFormData('additionalInfo.circumstances', e.target.value)}
            placeholder={`How ${reportType === 'lost' ? 'did you lose it' : 'did you find it'}? What were you doing?`}
            rows={3}
            className="w-full"
          />
        </div>

        {/* Show reward field for lost items */}
        {reportType === 'lost' && (
          <div className="col-12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward (Optional)
            </label>
            <InputText
              value={formData.additionalInfo.reward}
              onChange={(e) => updateFormData('additionalInfo.reward', e.target.value)}
              placeholder="e.g., $50 reward, No questions asked"
              className="w-full"
            />
          </div>
        )}

        {/* Show storage details for found items */}
        {reportType === 'found' && (
          <div className="col-12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage details (optional)
            </label>
            <InputTextarea
              value={formData.additionalInfo.storageLocation}
              onChange={(e) => updateFormData('additionalInfo.storageLocation', e.target.value)}
              placeholder="Any specific details about where you're keeping the item safe..."
              rows={3}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Contact Information</h3>
        <p className="text-gray-600">
          How should people contact you?
        </p>
      </div>

      <div className="grid">
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your name *
          </label>
          <InputText
            value={formData.contactInfo.name}
            onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
            placeholder="Full name"
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone number
          </label>
          <InputText
            value={formData.contactInfo.phone}
            onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
            placeholder="Your phone number"
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <InputText
            value={formData.contactInfo.email}
            onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
            placeholder="Your email address"
            className="w-full"
            type="email"
          />
        </div>
        
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred contact method *
          </label>
          <Dropdown
            value={formData.contactInfo.preferredContact}
            options={contactMethods}
            onChange={(e) => updateFormData('contactInfo.preferredContact', e.value)}
            className="w-full"
          />
        </div>

        {/* Show handover preference for found items */}
        {reportType === 'found' && (
          <div className="col-12">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to return the item? *
            </label>
            <div className="space-y-3">
              {handoverOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <RadioButton
                    inputId={option.value}
                    name="handover"
                    value={option.value}
                    onChange={(e) => updateFormData('handoverPreference', e.value)}
                    checked={formData.handoverPreference === option.value}
                  />
                  <label htmlFor={option.value} className="ml-2 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Message
        severity="info"
        text="Your contact information will only be shared with potential matches. We respect your privacy."
        className="w-full"
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#34373aff', color: '#ffffff' }}>
      <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div className="flex align-items-center justify-content-between mb-4">
             <Chip
              label={`${reportType === 'lost' ? 'Lost' : 'Found'} Item Report`}
              className={reportType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
            />
          </div>

          {/* Progress */}
          <Card className="mb-4">
            <div className="mb-3">
              <div className="flex justify-content-between align-items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {getStepProgress()}% Complete
                </span>
              </div>
              <ProgressBar value={getStepProgress()} className="h-6px" />
            </div>
            
            <Steps
              model={steps}
              activeIndex={currentStep}
              className="custom-steps"
            />
          </Card>

          {/* Form Content */}
          <Card className="p-4">
            {currentStep === 0 && renderReportTypeStep()}
            {currentStep === 1 && renderItemDetailsStep()}
            {currentStep === 2 && renderLocationInfoStep()}
            {currentStep === 3 && renderContactStep()}
          </Card>

          {/* Navigation */}
          <div className="flex justify-content-between mt-4">
            <Button
              label="Previous"
              icon="pi pi-chevron-left"
              className="p-button-outlined"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            />

            {currentStep < steps.length - 1 ? (
              <Button
                label="Next"
                icon="pi pi-chevron-right"
                iconPos="right"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              />
            ) : (
              <Button
                label={isSubmitting ? "Submitting..." : "Submit Report"}
                icon="pi pi-check"
                loading={isSubmitting}
                onClick={handleSubmit}
                className="p-button-success"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;