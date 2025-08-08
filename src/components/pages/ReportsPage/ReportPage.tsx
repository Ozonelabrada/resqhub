import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Message } from 'primereact/message';
import { Steps } from 'primereact/steps';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { RadioButton } from 'primereact/radiobutton';
import { SelectButton } from 'primereact/selectbutton';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { ItemsService } from '../../../services/itemsService';
import { AuthService } from '../../../services/authService';
import mapFormDataToApiPayload from '../../../utils/mapFormDataToApiPayload';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ItemSuggestion {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  productType?: string;
}

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toast = useRef<Toast>(null);

  // Backend data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ItemSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredBrandSuggestions, setFilteredBrandSuggestions] = useState<string[]>([]);
  const [filteredModelSuggestions, setFilteredModelSuggestions] = useState<string[]>([]);

  // Form data - Updated to match new API structure and enum defaults
  const [formData, setFormData] = useState({
    // Basic item information
    name: '',
    brand: '',
    model: '',
    categoryId: 0,
    category: '',
    description: '',
    manufacturer: '',
    productType: '',
    standardSpecs: '',
    color: '', // Added color property
    
    // Report information
    title: '',
    location: '',
    currentLocation: '', // For found items only
    date: null as Date | null,
    time: '',
    condition: 'good', // Default to 'good' (ID: 3)
    contactInfo: {
      name: '',
      phone: '',
      email: '',
      preferredContact: 'phone' // Default to 'phone' (ID: 1)
    },
    handoverPreference: 'meet', // Default to 'meet' (ID: 1)
    additionalInfo: {
      reward: '', // For lost items only
      circumstances: '',
      identifyingFeatures: '',
      storageLocation: '' // For found items only
    },
    images: [] as File[]
  });

  // Load backend data on component mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        setLoading(true);
        
        // Define response types
        type CategoriesResponseType = { data?: { data?: Category[] } };
        type ItemsResponseType = { data?: { data?: ItemSuggestion[] } };

        // Load categories and items in parallel
        const [categoriesResponse, itemsResponse] = await Promise.all([
          ItemsService.getCategories(100, 1) as Promise<CategoriesResponseType>,
          ItemsService.getItems(true, 100, 1) as Promise<ItemsResponseType>
        ]);

        console.log('Categories Response:', categoriesResponse);
        console.log('Items Response:', itemsResponse);

        // Set categories
        if (categoriesResponse?.data?.data) {
          setCategories(categoriesResponse.data.data);
        }

        // Set item suggestions
        if (itemsResponse?.data?.data) {
          setItemSuggestions(itemsResponse.data.data);
        }

      } catch (error) {
        console.error('Error loading backend data:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load form data. Please refresh the page.',
          life: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, []);

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

    // Load user profile from backend instead of localStorage
    const loadUserProfile = async () => {
      try {
        const userProfile = await AuthService.getCurrentUserProfile() as { data?: { name?: string; fullName?: string; email?: string } };
        console.log('User Profile:', userProfile);
        
        if (userProfile?.data) {
          setFormData(prev => ({
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              name: userProfile.data?.name || userProfile.data?.fullName || '',
              email: userProfile.data?.email || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage
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
      }
    };

    loadUserProfile();
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

  // Updated with backend enum values
  const conditionOptions = [
    { label: 'New', value: 'new', color: 'success' },
    { label: 'Excellent', value: 'excellent', color: 'success' },
    { label: 'Good', value: 'good', color: 'info' },
    { label: 'Fair', value: 'fair', color: 'warning' },
    { label: 'Poor', value: 'poor', color: 'warning' },
    { label: 'Damaged', value: 'damaged', color: 'danger' }
  ];

  const handoverOptions = [
    { label: 'Meet in person', value: 'meet' },
    { label: 'Pickup from my location', value: 'pickup' },
    { label: 'Mail/Ship to owner', value: 'mail' },
    { label: 'Courier delivery', value: 'courier' },
    { label: 'Drop off at location', value: 'dropoff' },
    { label: 'Police station handover', value: 'policestation' }
  ];

  const contactMethods = [
    { label: 'Phone', value: 'phone' },
    { label: 'Email', value: 'email' },
    { label: 'Both Phone & Email', value: 'both' },
    { label: 'SMS', value: 'sms' },
    { label: 'In-App messaging', value: 'inapp' }
  ];

  const steps = [
    { label: 'Report Type' },
    { label: 'Item Details' },
    { label: 'Location & Info' },
    { label: 'Contact & Submit' }
  ];

  // Updated search suggestions using backend data
  const searchSuggestions = (event: any) => {
    const query = event.query.toLowerCase();
    let filtered: ItemSuggestion[] = [];

    // Filter suggestions based on query
    filtered = itemSuggestions.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query)) ||
      (item.model && item.model.toLowerCase().includes(query))
    );

    // Sort by relevance (items starting with query come first)
    filtered.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query);
      const bStartsWith = b.name.toLowerCase().startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit to top 10 suggestions
    setFilteredSuggestions(filtered.slice(0, 10));
  };

  // Updated item selection using backend data
  const handleItemSelection = (selectedItem: ItemSuggestion) => {
    updateFormData('name', selectedItem.name);
    updateFormData('title', selectedItem.name);
    
    // Find and set category
    const category = categories.find(cat => cat.id === selectedItem.categoryId);
    if (category) {
      updateFormData('category', category.name);
      updateFormData('categoryId', category.id);
    }
    
    // Auto-fill other details if available
    if (selectedItem.brand) updateFormData('brand', selectedItem.brand);
    if (selectedItem.model) updateFormData('model', selectedItem.model);
    if (selectedItem.manufacturer) updateFormData('manufacturer', selectedItem.manufacturer);
    if (selectedItem.productType) updateFormData('productType', selectedItem.productType);
  };

  // Updated category suggestion using backend data
  const suggestCategoryForCustomItem = (item: string): string => {
    const itemLower = item.toLowerCase();
    
    // Define keywords for each category (you might want to make this backend-driven too)
    const categoryKeywords = {
      'Electronics': ['phone', 'iphone', 'android', 'laptop', 'computer', 'tablet', 'ipad', 'macbook', 'dell', 'hp', 'camera', 'headphone', 'airpods', 'watch', 'apple', 'samsung', 'sony', 'nintendo', 'xbox', 'playstation', 'charger', 'cable', 'mouse', 'keyboard', 'speaker', 'tv', 'monitor'],
      'Accessories': ['glasses', 'sunglasses', 'hat', 'cap', 'scarf', 'belt', 'gloves', 'umbrella', 'watch', 'bracelet'],
      'Keys': ['key', 'keys', 'keychain', 'remote', 'fob'],
      'Jewelry': ['ring', 'necklace', 'earring', 'bracelet', 'pendant', 'gold', 'silver', 'diamond', 'jewelry', 'jewellery'],
      'Documents': ['passport', 'license', 'id', 'card', 'certificate', 'paper', 'document', 'receipt', 'ticket'],
      'Clothing': ['shirt', 'jacket', 'coat', 'jeans', 'pants', 'dress', 'skirt', 'shoes', 'boots', 'sneakers', 'socks', 'tie', 'suit', 'hoodie', 'sweater'],
      'Bags & Wallets': ['wallet', 'purse', 'bag', 'backpack', 'handbag', 'briefcase', 'suitcase', 'luggage'],
      'Pets': ['dog', 'cat', 'pet', 'puppy', 'kitten', 'bird', 'rabbit', 'hamster', 'fish', 'turtle'],
      'Vehicles': ['bike', 'bicycle', 'car', 'motorcycle', 'scooter', 'skateboard', 'truck', 'van'],
      'Other': []
    };

    // Check each category for matching keywords
    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
      if (categoryName === 'Other') continue;
      
      const hasMatch = keywords.some(keyword => itemLower.includes(keyword));
      if (hasMatch) {
        const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        return category ? category.name : categoryName;
      }
    }

    // Default to 'Other' if no match found
    const otherCategory = categories.find(cat => cat.name.toLowerCase() === 'other');
    return otherCategory ? otherCategory.name : 'Other';
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
                    [child]: value
        }
      }));
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };
        
        // Auto-sync name and title
        if (field === 'name') {
          newData.title = value;
        } else if (field === 'title') {
          newData.name = value;
        }
        
        // Auto-set categoryId when category is selected
        if (field === 'category') {
          const categoryObj = categories.find(cat => cat.name === value);
          if (categoryObj) {
            newData.categoryId = categoryObj.id;
          }
        }
        
        return newData;
      });
    }
  };

  // Updated validation
  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return reportType !== null;
      case 1:
        return formData.name && formData.category && formData.description && formData.description.length >= 10;
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

  // Updated handleSubmit function for new API structure
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);

    try {
      // Get all payloads for the new API structure
      const { 
        reportPayload, 
        itemDetailsPayload, 
        contactInfoPayload, 
        locationDetailsPayload 
      } = mapFormDataToApiPayload(reportType, formData);
      
      console.log('Report Payload:', reportPayload);
      console.log('Item Details Payload:', itemDetailsPayload);
      console.log('Contact Info Payload:', contactInfoPayload);
      console.log('Location Details Payload:', locationDetailsPayload);
      
      // Step 1: Create the main report (without reference IDs)
      type ReportResponseType = { data?: { id?: number } };
      const reportResponse = await ItemsService.createReport(reportPayload) as ReportResponseType;
      console.log('Report created:', reportResponse);
      
      if (!reportResponse || !reportResponse.data || !reportResponse.data.id) {
        throw new Error('Failed to create report - no report ID returned');
      }
      
      const reportId = reportResponse.data.id;
      
      // Step 2: Upload images if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        try {
          const imageUploadPromises = formData.images.map(file => 
            ItemsService.uploadImage(file, reportId)
          );
          
          const imageResponses = await Promise.all(imageUploadPromises);
          imageUrls = imageResponses
            .filter((response): response is { data: { url: string } } => !!(response && typeof response === 'object' && 'data' in response && (response as any).data && 'url' in (response as any).data))
            .map(response => response.data.url);
          
          console.log('Images uploaded:', imageUrls);
        } catch (imageError) {
          console.warn('Some images failed to upload:', imageError);
          // Continue with form submission even if images fail
        }
      }
      
      // Step 3: Create item details with the report ID and image URLs
      const itemDetailsWithReportId = {
        ...itemDetailsPayload,
        reportId: reportId,
        imageUrls: imageUrls
      };
      
      // Add explicit types for the responses
      type DetailResponseType = { data?: { id?: number } };

      const itemDetailsResponse = await ItemsService.createReportItemDetails(itemDetailsWithReportId) as DetailResponseType;
      console.log('Item details created:', itemDetailsResponse);
      
      // Step 4: Create contact info with the report ID
      const contactInfoWithReportId = {
        ...contactInfoPayload,
        reportId: reportId
      };
      
      const contactInfoResponse = await ItemsService.createReportContactInfo(contactInfoWithReportId) as DetailResponseType;
      console.log('Contact info created:', contactInfoResponse);
      
      // Step 5: Create location details with the report ID
      const locationDetailsWithReportId = {
        ...locationDetailsPayload,
        reportId: reportId
      };
      
      const locationDetailsResponse = await ItemsService.createReportLocationDetails(locationDetailsWithReportId) as DetailResponseType;
      console.log('Location details created:', locationDetailsResponse);
      
      // Step 6: Update the main report with the detail IDs (if backend requires this)
      if (itemDetailsResponse?.data?.id || contactInfoResponse?.data?.id || locationDetailsResponse?.data?.id) {
        const updatePayload: any = {};
        
        if (itemDetailsResponse?.data?.id) {
          updatePayload.reportItemDetailsId = itemDetailsResponse.data.id;
        }
        
        if (contactInfoResponse?.data?.id) {
          updatePayload.reportContactInfoId = contactInfoResponse.data.id;
        }
        
        if (locationDetailsResponse?.data?.id) {
          updatePayload.reportLocationDetailsId = locationDetailsResponse.data.id;
        }
        
        // Only update if we have IDs to update
        if (Object.keys(updatePayload).length > 0) {
          try {
            const updateResponse = await ItemsService.updateReport(reportId, updatePayload);
            console.log('Report updated with detail IDs:', updateResponse);
          } catch (updateError) {
            console.warn('Failed to update report with detail IDs:', updateError);
            // Don't fail the entire process for this
          }
        }
      }
      
      // Show success message
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `${reportType === 'lost' ? 'Lost' : 'Found'} item report submitted successfully!`,
        life: 3000
      });

      // Navigate to success page or home
      navigate('/');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit report. Please try again.',
        life: 5000
      });
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

  // Show loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#34373aff', color: '#ffffff' }}>
        <div className="p-6">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
            <div className="text-white text-2xl mb-4">Loading form data...</div>
            <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
          </div>
        </div>
      </div>
    );
  }

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
          <AutoComplete
            value={formData.name}
            suggestions={filteredSuggestions}
            completeMethod={searchSuggestions}
            field="name"
            onChange={(e) => {
              const selectedValue = e.value as string | ItemSuggestion;
              updateFormData('name', typeof selectedValue === 'string' ? selectedValue : selectedValue?.name || '');

              // Auto-suggest category, brand, and model for custom text input
              if (typeof selectedValue === 'string' && selectedValue.length > 2) {
                // Try to find a matching suggestion
                const match = itemSuggestions.find(
                  item => item.name.toLowerCase() === selectedValue.toLowerCase()
                );
                if (match) {
                  if (!formData.category) updateFormData('category', match.categoryName);
                  if (!formData.brand && match.brand) updateFormData('brand', match.brand);
                  if (!formData.model && match.model) updateFormData('model', match.model);
                } else {
                  // Fallback to keyword-based category suggestion
                  const suggestedCategory = suggestCategoryForCustomItem(selectedValue);
                  if (!formData.category) updateFormData('category', suggestedCategory);
                }
              }
            }}
            onSelect={(e) => {
              if (typeof e.value === 'object' && e.value !== null) {
                handleItemSelection(e.value as ItemSuggestion);
              }
            }}
            placeholder="Start typing... e.g., iPhone 14, Blue Wallet, Set of Keys..."
            className="w-full"
            dropdown
            forceSelection={false}
            minLength={1}
            delay={300}
            emptyMessage="No suggestions found. Type to search common items or enter your custom item."
            itemTemplate={(item: ItemSuggestion) => (
              <div className="flex align-items-center justify-content-between p-2">
                <div className="flex align-items-center">
                  <i className="pi pi-search mr-2 text-gray-400"></i>
                  <div>
                    <div>{item.name}</div>
                    {item.brand && <small className="text-gray-500">{item.brand}</small>}
                  </div>
                </div>
                <small className="text-gray-500">
                  {item.categoryName}
                </small>
              </div>
            )}
          />
          <small className="text-gray-500 block mt-1">
            💡 Start typing to see suggestions with auto-category selection, or enter your own item
          </small>
        </div>
        
        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category * {formData.category && formData.name && (
              <span className="text-green-600 text-xs">
                (Auto-selected for "{formData.name}")
              </span>
            )}
          </label>
          <Dropdown
            value={formData.category}
            options={categories.map(cat => ({ label: cat.name, value: cat.name }))}
            onChange={(e) => updateFormData('category', e.value)}
            optionLabel="label"
            optionValue="value"
            placeholder="Select a category"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <AutoComplete
            value={formData.brand}
            suggestions={filteredBrandSuggestions}
            completeMethod={searchBrandSuggestions}
            onChange={(e) => updateFormData('brand', e.value)}
            placeholder="e.g., Apple, Samsung, Nike..."
            className="w-full"
            dropdown
            forceSelection={false}
            minLength={1}
            delay={200}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <AutoComplete
            value={formData.model}
            suggestions={filteredModelSuggestions}
            completeMethod={searchModelSuggestions}
            onChange={(e) => updateFormData('model', e.value)}
            placeholder="e.g., iPhone 14 Pro, Galaxy S24..."
            className="w-full"
            dropdown
            forceSelection={false}
            minLength={1}
            delay={200}
          />
        </div>

        {/* Show color for found items */}
        {reportType === 'found' && (
          <div className="col-12 md:col-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <InputText
              value={formData.color || ''}
              onChange={(e) => updateFormData('color', e.target.value)}
              placeholder="e.g., Blue, Black, Red..."
              className="w-full"
            />
          </div>
        )}

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
            placeholder="Provide detailed description including color, size, distinctive features..."
            rows={4}
            className="w-full"
          />
          <small className="text-gray-500">
            {formData.description.length}/500 characters (minimum 10)
          </small>
        </div>

        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standard Specifications
          </label>
          <InputTextarea
            value={formData.standardSpecs}
            onChange={(e) => updateFormData('standardSpecs', e.target.value)}
            placeholder="Technical specifications, dimensions, weight, serial numbers..."
            rows={3}
            className="w-full"
          />
          <small className="text-gray-500 block mt-1">
            💡 Include technical details, serial numbers, or specifications if known
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
            className="w-full p-fileupload-choose p-fileupload-filename"
            auto={false}
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

        {/* Enhanced preview of what will be saved */}
        {formData.name && formData.category && (
          <div className="col-12">
            <div className="p-3 bg-blue-50 border-round border-1 border-blue-200">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-info-circle text-blue-600"></i>
                <span className="font-semibold text-blue-800">Item Information Preview</span>
              </div>
              <div className="text-sm text-blue-700 grid">
                <div className="col-6">
                  <strong>Name:</strong> {formData.name}<br />
                  <strong>Category:</strong> {formData.category} (ID: {formData.categoryId})<br />
                  <strong>Brand:</strong> {formData.brand || 'Not specified'}<br />
                  <strong>Model:</strong> {formData.model || 'Not specified'}
                </div>
                <div className="col-6">
                  {reportType === 'found' && (
                    <>
                      <strong>Color:</strong> {formData.color || 'Not specified'}<br />
                      <strong>Condition:</strong> {formData.condition || 'Not specified'}<br />
                    </>
                  )}
                  <strong>Images:</strong> {formData.images.length} selected
                </div>
              </div>
            </div>
          </div>
        )}
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

  const searchBrandSuggestions = (event: any) => {
    const query = event.query.toLowerCase();
    const brands = Array.from(
      new Set(itemSuggestions
        .filter(item => item.brand)
        .map(item => item.brand!)
      )
    );
    setFilteredBrandSuggestions(
      brands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 10)
    );
  };

  const searchModelSuggestions = (event: any) => {
    const query = event.query.toLowerCase();
    const models = Array.from(
      new Set(itemSuggestions
        .filter(item => item.model)
        .map(item => item.model!)
      )
    );
    setFilteredModelSuggestions(
      models.filter(model => model.toLowerCase().includes(query)).slice(0, 10)
    );
  };

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
      
      <Toast ref={toast} />
    </div>
  );
};

export default ReportPage;