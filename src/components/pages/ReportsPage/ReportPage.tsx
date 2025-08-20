import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
import  { ItemsService } from '../../../services/itemsService';
import { AuthService } from '../../../services/authService';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';

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

interface FormDataType {
  itemId: number | undefined;
  itemDetailsId?: number;
  locationId?: number;
  contactId?: number;
  name: string;
  brand: string;
  model: string;
  categoryId: number;
  category: string;
  description: string;
  manufacturer: string;
  productType: string;
  standardSpecs: string;
  color: string;
  title: string;
  location: string;
  currentLocation: string;
  date: Date | null;
  time: string;
  condition: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    preferredContact: string;
    [key: string]: any;
  };
  handoverPreference: string;
  additionalInfo: {
    reward: string;
    circumstances: string;
    identifyingFeatures: string;
    storageLocation: string;
    [key: string]: any;
  };
  images: File[];
  [key: string]: any;
}

const LOCAL_STORAGE_KEY = 'reportFormData';

const getInitialFormData = (): FormDataType => ({
  itemId: undefined,
  name: '',
  brand: '',
  model: '',
  categoryId: 0,
  category: '',
  description: '',
  manufacturer: '',
  productType: '',
  standardSpecs: '',
  color: '',
  title: '',
  location: '',
  currentLocation: '',
  date: null,
  time: '',
  condition: 'good',
  contactInfo: {
    name: '',
    phone: '',
    email: '',
    preferredContact: 'phone'
  },
  handoverPreference: 'meet',
  additionalInfo: {
    reward: '',
    circumstances: '',
    identifyingFeatures: '',
    storageLocation: ''
  },
  images: []
});

const ReportPage: React.FC = () => {
  // --- Hooks (always at the top) ---
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const toast = useRef<Toast>(null);
  const accountMenuRef = useRef<Menu>(null);

  // --- State ---
  const [currentStep, setCurrentStep] = useState(0);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ItemSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredBrandSuggestions, setFilteredBrandSuggestions] = useState<string[]>([]);
  const [filteredModelSuggestions, setFilteredModelSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormDataType>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialFormData();
      }
    }
    return getInitialFormData();
  });

  // --- Effects ---
  // Save formData to localStorage on every change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Load backend data on mount
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          ItemsService.getCategories(100, 1),
          ItemsService.getItems(true, 100, 1)
        ]);
        if (isMounted) {
          // Defensive: always set to array
          setCategories(Array.isArray(categoriesResponse?.data?.data) ? categoriesResponse.data.data : []);
          setItemSuggestions(Array.isArray(itemsResponse?.data?.data) ? itemsResponse.data.data : []);
        }
      } catch (error) {
        if (isMounted) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load form data. Please refresh the page.',
            life: 5000
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Auth and user profile
  useEffect(() => {
    const token = localStorage.getItem('publicUserToken');
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }
    const type = searchParams.get('type');
    if (type === 'lost' || type === 'found') setReportType(type);

    const loadUserProfile = async () => {
      try {
        const userProfile = await AuthService.getCurrentUserProfile() as { data?: { name?: string; fullName?: string; email?: string } };
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
      } catch (error: any) {
        if (error?.response?.status === 401) {
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
      }
    };
    loadUserProfile();
  }, [searchParams, navigate]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth state sync (cross-tab and in-app)
  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem('publicUserToken');
      const user = localStorage.getItem('publicUserData');
      setIsAuthenticated(!!token);
      setUserData(user ? (() => { try { return JSON.parse(user); } catch { return null; } })() : null);
    };
    updateAuthState();
    window.addEventListener('storage', updateAuthState);
    return () => window.removeEventListener('storage', updateAuthState);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('publicUserToken');
    const user = localStorage.getItem('publicUserData');
    setIsAuthenticated(!!token);
    setUserData(user ? (() => { try { return JSON.parse(user); } catch { return null; } })() : null);
  }, [location]);

  // Cleanup effect to clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    };
  }, []);

  // --- Handlers ---
  const updateFormData = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        if (field === 'name') newData.title = value;
        else if (field === 'title') newData.name = value;
        if (field === 'category') {
          const categoriesArray = Array.isArray(categories) ? categories : [];
          const categoryObj = categoriesArray.find(cat => cat.name === value);
          if (categoryObj) newData.categoryId = categoryObj.id;
        }
        return newData;
      });
    }
  }, [categories]);

  const validateStep = useCallback((step: number) => {
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
        return formData.contactInfo.name && (formData.contactInfo.phone || formData.contactInfo.email);
      default:
        return true;
    }
  }, [formData, reportType]);

  const getStepProgress = () => Math.round(((currentStep + 1) / steps.length) * 100);

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    // Step 1: Item
    if (currentStep === 1 && !formData.itemId) {
      setIsSubmitting(true);
      try {
        const itemPayload = {
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          categoryId: formData.categoryId,
          description: formData.description,
          manufacturer: formData.manufacturer,
          productType: formData.productType,
          standardSpecs: formData.standardSpecs,
          color: formData.color,
        };
        const itemRes = await ItemsService.createItem(itemPayload) as { data?: { id?: number } };
        if (!itemRes?.data?.id) throw new Error('Failed to create item');
        if (itemRes?.data?.id) {
          setFormData(prev => ({ ...prev, itemId: itemRes.data!.id }));
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create item. Please try again.',
          life: 5000
        });
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    // Step 2: ItemDetails & Location
    if (currentStep === 2 && !formData.itemDetailsId) {
      setIsSubmitting(true);
      try {
        // ItemDetails
        const itemDetailsPayload = {
          itemId: formData.itemId,
          images: formData.images,
          identifyingFeatures: formData.additionalInfo.identifyingFeatures,
          standardSpecs: formData.standardSpecs,
          brand: formData.brand,
          model: formData.model,
          manufacturer: formData.manufacturer,
          productType: formData.productType,
          color: formData.color,
          condition: formData.condition,
        };
        const itemDetailsRes = await ItemsService.createItemDetails(itemDetailsPayload) as { data?: { id?: number } };
        if (!itemDetailsRes?.data?.id) throw new Error('Failed to create item details');
        // Location
        const locationPayload = {
          itemId: formData.itemId,
          location: formData.location,
          currentLocation: formData.currentLocation,
          date: formData.date,
          time: formData.time,
          circumstances: formData.additionalInfo.circumstances,
          storageLocation: formData.additionalInfo.storageLocation,
        };
        const locationRes = await ItemsService.createLocation(locationPayload) as { data?: { id?: number } };
        if (!locationRes?.data?.id) throw new Error('Failed to create location');
        setFormData(prev => ({
          ...prev,
          itemDetailsId: itemDetailsRes.data ? itemDetailsRes.data.id : undefined,
          locationId: locationRes.data ? locationRes.data.id : undefined
        }));
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save item details or location. Please try again.',
          life: 5000
        });
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    // Step 3: Contact & Report
    if (currentStep === 3 && !formData.contactId) {
      setIsSubmitting(true);
      try {
        // Contact
        const contactPayload = {
          itemId: formData.itemId,
          name: formData.contactInfo.name,
          phone: formData.contactInfo.phone,
          email: formData.contactInfo.email,
          preferredContact: formData.contactInfo.preferredContact,
          handoverPreference: formData.handoverPreference,
          reward: formData.additionalInfo.reward,
        };
        const contactRes = await ItemsService.createContact(contactPayload) as { data?: { id?: number } };
        if (!contactRes?.data?.id) throw new Error('Failed to create contact');
        if (contactRes?.data?.id) {
          setFormData(prev => ({ ...prev, contactId: contactRes.data!.id }));
        }

        // Report
        const reportPayload = {
          itemId: formData.itemId,
          itemDetailsId: formData.itemDetailsId,
          locationId: formData.locationId,
          contactId: contactRes.data.id,
          reportType,
        };
        const reportRes = await ItemsService.createReport(reportPayload) as { data?: { id?: number } };
        if (!reportRes?.data?.id) throw new Error('Failed to create report');

        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `${reportType === 'lost' ? 'Lost' : 'Found'} item report submitted successfully!`,
          life: 3000
        });
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        navigate('/');
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save contact or report. Please try again.',
          life: 5000
        });
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      return;
    }

    // Move to next step if not final
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleImageUpload = (event: any) => {
    const files = Array.from(event.files) as File[];
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Incomplete Form',
        detail: 'Please fill in all required fields before submitting.',
        life: 4000
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let itemId = formData.itemId;
      if (!itemId) {
        const itemPayload = {
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          categoryId: formData.categoryId,
          description: formData.description,
          manufacturer: formData.manufacturer,
          productType: formData.productType,
          standardSpecs: formData.standardSpecs,
          color: formData.color,
        };
        const itemRes = await ItemsService.createItem(itemPayload) as unknown as { data?: { id?: number } };
        console.log('createItem response:', itemRes);
        if (!itemRes?.data?.id) throw new Error('Failed to create item');
        itemId = itemRes.data.id;
        setFormData(prev => ({ ...prev, itemId }));
      }
      if (formData.images.length > 0) {
        const uploadPromises = formData.images.map(file => ItemsService.uploadImage(file, itemId));
        const uploadResults = await Promise.all(uploadPromises);
        console.log('uploadImage results:', uploadResults);
      }
      const itemDetailsPayload = {
        itemId,
        images: formData.images,
        identifyingFeatures: formData.additionalInfo.identifyingFeatures,
        standardSpecs: formData.standardSpecs,
        brand: formData.brand,
        model: formData.model,
        manufacturer: formData.manufacturer,
        productType: formData.productType,
        color: formData.color,
        condition: formData.condition,
      };
      const itemDetailsRes = await ItemsService.createItemDetails(itemDetailsPayload) as unknown as { data?: { id?: number } };
      console.log('createItemDetails response:', itemDetailsRes);
      if (!itemDetailsRes?.data?.id) throw new Error('Failed to create item details');
      const itemDetailsId = itemDetailsRes.data.id;

      const locationPayload = {
        itemId,
        location: formData.location,
        currentLocation: formData.currentLocation,
        date: formData.date,
        time: formData.time,
        circumstances: formData.additionalInfo.circumstances,
        storageLocation: formData.additionalInfo.storageLocation,
      };
      const locationRes = await ItemsService.createLocation(locationPayload) as unknown as { data?: { id?: number } };
      console.log('createLocation response:', locationRes);
      if (!locationRes?.data?.id) throw new Error('Failed to create location');
      const locationId = locationRes.data.id;

      const contactPayload = {
        itemId,
        name: formData.contactInfo.name,
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email,
        preferredContact: formData.contactInfo.preferredContact,
        handoverPreference: formData.handoverPreference,
        reward: formData.additionalInfo.reward,
      };
      const contactRes = await ItemsService.createContact(contactPayload) as unknown as { data?: { id?: number } };
      console.log('createContact response:', contactRes);
      if (!contactRes?.data?.id) throw new Error('Failed to create contact');
      const contactId = contactRes.data.id;

      const reportPayload = {
        itemId,
        itemDetailsId,
        locationId,
        contactId,
        reportType,
      };
      const reportRes = await ItemsService.createReport(reportPayload) as { data?: { id?: number } };
      console.log('createReport response:', reportRes);
      if (!reportRes?.data?.id) throw new Error('Failed to create report');

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `${reportType === 'lost' ? 'Lost' : 'Found'} item report submitted successfully!`,
        life: 3000
      });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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

  // --- Suggestions ---
  const [filteredCategorySuggestions, setFilteredCategorySuggestions] = useState<string[]>([]);

// Function to search category suggestions
const searchCategorySuggestions = useCallback((event: any) => {
  const query = event.query.toLowerCase();
  const categoriesList = categories.map(cat => cat.name);
  setFilteredCategorySuggestions(
    categoriesList.filter(category => category.toLowerCase().includes(query)).slice(0, 10)
  );
}, [categories]);
  const searchSuggestions = useCallback((event: any) => {
    const query = event.query.toLowerCase();
    const suggestionsArray = Array.isArray(itemSuggestions) ? itemSuggestions : [];
    let filtered = suggestionsArray.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query)) ||
      (item.model && item.model.toLowerCase().includes(query))
    );
    filtered.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query);
      const bStartsWith = b.name.toLowerCase().startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    });
    setFilteredSuggestions(filtered.slice(0, 10));
  }, [itemSuggestions]);

  const handleItemSelection = useCallback((selectedItem: ItemSuggestion) => {
    updateFormData('name', selectedItem.name);
    updateFormData('title', selectedItem.name);
    const category = categories.find(cat => cat.id === selectedItem.categoryId);
    if (category) {
      updateFormData('category', category.name);
      updateFormData('categoryId', category.id);
    }
    if (selectedItem.brand) updateFormData('brand', selectedItem.brand);
    if (selectedItem.model) updateFormData('model', selectedItem.model);
    if (selectedItem.manufacturer) updateFormData('manufacturer', selectedItem.manufacturer);
    if (selectedItem.productType) updateFormData('productType', selectedItem.productType);
  }, [categories, updateFormData]);

  const searchBrandSuggestions = useCallback((event: any) => {
    const query = event.query.toLowerCase();
    const brands = Array.from(new Set(itemSuggestions.filter(item => item.brand).map(item => item.brand!)));
    setFilteredBrandSuggestions(brands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 10));
  }, [itemSuggestions]);

  const searchModelSuggestions = useCallback((event: any) => {
    const query = event.query.toLowerCase();
    const models = Array.from(new Set(itemSuggestions.filter(item => item.model).map(item => item.model!)));
    setFilteredModelSuggestions(models.filter(model => model.toLowerCase().includes(query)).slice(0, 10));
  }, [itemSuggestions]);

  // --- UI Data ---
  const reportTypeOptions = [
    { label: 'Lost Item', value: 'lost', icon: 'pi pi-minus-circle' },
    { label: 'Found Item', value: 'found', icon: 'pi pi-plus-circle' }
  ];
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
  const accountMenuItems = [
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        localStorage.removeItem('publicUserToken');
        localStorage.removeItem('publicUserData');
        setIsAuthenticated(false);
        setUserData(null);
        navigate('/');
      }
    }
  ];

  // --- Render ---
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

              if (typeof selectedValue === 'string' && selectedValue.length > 2) {
                const match = itemSuggestions.find(
                  item => item.name.toLowerCase() === selectedValue.toLowerCase()
                );
                if (match) {
                  if (!formData.category) updateFormData('category', match.categoryName);
                  if (!formData.brand && match.brand) updateFormData('brand', match.brand);
                  if (!formData.model && match.model) updateFormData('model', match.model);
                } else {
                  const suggestedCategory = filteredCategorySuggestions.find(cat => cat.toLowerCase() === selectedValue.toLowerCase());
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
          <AutoComplete
            value={formData.category}
            suggestions={filteredCategorySuggestions}
            completeMethod={searchCategorySuggestions}
            onChange={(e) => updateFormData('category', e.value)}
            placeholder="e.g., Electronics, Clothing, Home..."
            className="w-full"
            dropdown
            forceSelection={false}
            minLength={1}
            delay={200}
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
                {file instanceof File ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-4rem h-4rem object-cover border-round"
                  />
                ) : (
                  <span>Invalid file</span>
                )}
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

  // --- Main Render ---
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
      color: '#ffffff'
    }}>
      <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div className="flex align-items-center justify-content-between mb-4">
            <Chip
              label={`${reportType === 'lost' ? 'Lost' : 'Found'} Item Report`}
              className={reportType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
            />
            {/* Auth display */}
            {isAuthenticated && userData ? (
              <div className="flex align-items-center gap-2">
                <Avatar
                  icon="pi pi-user"
                  shape="circle"
                  style={{ backgroundColor: 'white', color: '#1e40af', cursor: 'pointer' }}
                />
                <span className="text-sm text-white font-semibold">{userData.name || userData.email}</span>
                <Menu
                  model={accountMenuItems}
                  popup
                  ref={accountMenuRef}
                  className="mt-2"
                  style={{ minWidth: '160px' }}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  label="Sign In"
                  icon="pi pi-sign-in"
                  className="p-button-outlined p-button-sm"
                  onClick={() => navigate('/signin')}
                />
                <Button
                  label="Sign Up"
                  icon="pi pi-user-plus"
                  className="p-button-text p-button-sm"
                  onClick={() => navigate('/signup')}
                />
              </div>
            )}
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