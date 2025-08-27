import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from '../../../context/AuthContext';

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
  reportId: number | undefined;
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
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

const LOCAL_STORAGE_KEY = 'reportFormData';

const getInitialFormData = (): FormDataType => ({
  reportId: undefined,
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
  images: [],
  latitude: 14.5995, 
  longitude: 120.9842,
});

function ReportPage() {
  // --- Hooks (always at the top) ---
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const toast = useRef<Toast>(null);
  const accountMenuRef = useRef<Menu>(null);

  // Use AuthContext only
  const auth = useAuth();

  // --- State ---
  const [currentStep, setCurrentStep] = useState(0);
  const [itemChecked, setItemChecked] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
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

  // New state for brand suggestions
  const [filteredBrandSuggestions, setFilteredBrandSuggestions] = useState<string[]>([]);
  const [filteredModelSuggestions, setFilteredModelSuggestions] = useState<string[]>([]);
  const [filteredNameSuggestions, setFilteredNameSuggestions] = useState<ItemSuggestion[]>([]);
  
  // Brand suggestions for AutoComplete
  const searchBrandSuggestions = useCallback((event: any) => {
    const query = event.query.toLowerCase();
    const brands = Array.isArray(itemSuggestions)
      ? itemSuggestions
          .map(item => item.brand)
          .filter((brand): brand is string => !!brand)
      : [];
    const uniqueBrands = Array.from(new Set(brands));
    setFilteredBrandSuggestions(
      uniqueBrands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 10)
    );
  }, [itemSuggestions]);

  const searchModelSuggestions = useCallback((event: any) => {
    const query = event.query.toLowerCase();
    const models = Array.isArray(itemSuggestions)
      ? itemSuggestions
          .map(item => item.model)
          .filter((model): model is string => !!model)
      : [];
    const uniqueModels = Array.from(new Set(models));
    setFilteredModelSuggestions(
      uniqueModels.filter(model => model.toLowerCase().includes(query)).slice(0, 10)
    );
  }, [itemSuggestions]);

  const searchNameSuggestions = useCallback(
  async (event: any) => {
    const query = event.query?.trim();
    if (!query) {
      setFilteredNameSuggestions([]);
      return;
    }
    try {
      const response = await ItemsService.getItems(
        true, // isActive
        50,   // pageSize
        1     // page
      );
      const itemsArr = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      const filteredArr = itemsArr.filter((item: any) =>
        item.name && item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNameSuggestions(filteredArr.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        categoryId: item.categoryId,
        categoryName: categories.find((cat) => cat.id === item.categoryId)?.name || '', // <-- Fix here
        manufacturer: item.manufacturer,
        productType: item.productType,
      })));
    } catch (error) {
      setFilteredNameSuggestions([]);
    }
  },
  [auth?.token, categories] // <-- Add categories as dependency
);

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
      // Fetch both categories and items in parallel
      const [categoriesResponse, itemsResponse] = await Promise.all([
        ItemsService.getCategories(100, 1),
        ItemsService.getItems(true, 100, 1)
      ]);
      // Correct extraction for deeply nested data
      const categoriesArr = Array.isArray(categoriesResponse?.data?.data?.data)
        ? categoriesResponse.data.data.data
        : [];
      const itemsArr = Array.isArray(itemsResponse?.data?.data?.data)
        ? itemsResponse.data.data.data
        : [];
      // Map items to include categoryName for preview
      const mappedItems = itemsArr.map((item: any) => ({
        ...item,
        categoryName: categoriesArr.find((cat: any) => cat.id === item.categoryId)?.name || ''
      }));
      if (isMounted) {
        setCategories(categoriesArr);
        setItemSuggestions(mappedItems);
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
}, [location.key]);

  // Auth and user profile
  useEffect(() => {
    if (!auth) return;
    if (!auth?.token) {
      navigate('/signin', { replace: true });
    }
  }, [auth?.token, navigate]);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'lost' || type === 'found') setReportType(type);
  }, [searchParams]);

// Add a state to hold the latest profile data for suggestions
const [profileSuggestion, setProfileSuggestion] = useState<{ name?: string; email?: string; phone?: string; address?: string }>({
  name: '',
  email: '',
  phone: '',
  address: ''
});

useEffect(() => {
  const loadUserProfile = async () => {
    try {
      const userProfile = await AuthService.getCurrentUserProfile();
      const data = userProfile?.data;
      if (data) {
        setProfileSuggestion({
          name: data.fullName || data.name || data.userName || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          address: data.address || ''
        });
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            name: prev.contactInfo.name || data.fullName || data.name || data.userName || '',
            email: prev.contactInfo.email || data.email || '',
            phone: prev.contactInfo.phone || data.phoneNumber || '',
            address: prev.contactInfo.address || data.address || ''
          }
        }));
      }
    } catch (error: any) {
      if (error?.response?.status === 401 && auth?.userData) {
        const user = typeof auth.userData === 'string' ? JSON.parse(auth.userData) : auth.userData;
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            name: prev.contactInfo.name || user?.fullName || user?.name || user?.userName || '',
            email: prev.contactInfo.email || user?.email || '',
            phone: prev.contactInfo.phone || user?.phoneNumber || '',
            address: prev.contactInfo.address || user?.address || ''
          }
        }));
      }
    }
  };
  loadUserProfile();
}, [searchParams, auth?.token, auth?.userData]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // 1. Create the report and save reportId in state
const handleProceed = async () => {
  setIsSubmitting(true);
  try {
    if (!formData.reportId) {
      const userId = auth?.userData?.id || auth?.userData?.userId;
      const reportTypeValue = reportType === 'lost' ? 1 : 2;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const reportPayload = {
        userId,
        reportType: reportTypeValue,
        description: formData.description,
        expiresAt: expiresAt.toISOString(),
        itemId: formData.itemId,
      };

      const reportRes = await ItemsService.createReport(reportPayload);
      // Use the correct path to get reportId
      const newReportId = reportRes?.data?.data?.reportId;
      if (newReportId) {
        setFormData(prev => ({ ...prev, reportId: newReportId }));
      } else {
        throw new Error('Failed to create report');
      }
    }
    setItemChecked(true);
  } catch (error) {
    console.log('Error creating report:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  // 2. Use the latest reportId from state for item details
  const handleNext = async () => {
  if (currentStep === 1) {
    if (!itemChecked) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Action Required',
        detail: 'Please click Proceed to create the report before continuing.',
        life: 4000
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Always use the latest reportId from state
      const reportId = formData.reportId;
      if (!reportId) throw new Error('Missing reportId');

      // 1. ITEM
      let itemId = formData.itemId;
      if (!itemId) {
        const itemPayload = {
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          categoryId: formData.categoryId,
        };
        const itemRes = await ItemsService.createItem(itemPayload);
        if (itemRes?.status === 200 || itemRes?.status === 201) {
          itemId = itemRes.data.id;
          setFormData(prev => ({ ...prev, itemId }));
        } else {
          throw new Error('Failed to create item');
        }
      }

      // 2. ITEM DETAILS (use reportId from formData, which should be set by handleProceed)
      let itemDetailsId = formData.itemDetailsId;
      if (!itemDetailsId) {
        const conditionMap: Record<string, number> = {
          new: 1,
          excellent: 2,
          good: 3,
          fair: 4,
          poor: 5,
          damaged: 6,
        };
        const handoverMap: Record<string, number> = {
          meet: 1,
          pickup: 2,
          mail: 3,
          courier: 4,
          dropoff: 5,
          policestation: 6,
        };

        const imageUrls: string[] = [];

        const itemDetailsPayload = {
          reportId,
          standardSpecification: formData.standardSpecs,
          color: formData.color,
          condition: conditionMap[formData.condition] ?? 1,
          distinguishingMarks: formData.additionalInfo.identifyingFeatures,
          handoverPreference: handoverMap[formData.handoverPreference] ?? 1,
          storageLocation: formData.additionalInfo.storageLocation,
          rewardAmount: Number(formData.additionalInfo.reward) || 0,
          imageUrls,
        };

        const itemDetailsRes = await ItemsService.createItemDetails(itemDetailsPayload);
        const newItemDetailsId = itemDetailsRes?.data?.data;
        if (newItemDetailsId) {
          setFormData(prev => {
            const updated = { ...prev, itemDetailsId: newItemDetailsId };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
          // Immediately proceed to next step
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
          return;
        } else {
          throw new Error('Failed to create item details');
        }
      }
      // If itemDetailsId already exists, just proceed
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      console.log('Error in transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
    return;
  }

  if (currentStep === 2) {
    setIsSubmitting(true);
    try {
      const locationPayload = {
        reportId: formData.reportId,
        incidentLocation: formData.location,
        incidentDate: formData.date ? new Date(formData.date).toISOString() : null,
        incidentTime: formData.time,
        circumstances: formData.additionalInfo.circumstances,
        latitude: formData.latitude, 
        longitude: formData.longitude, 
        city: "", 
        state: "Philippines", 
      };

      const locationRes = await ItemsService.createLocation(locationPayload);
      const newLocationId = locationRes?.data?.data;
      if (newLocationId) {
        setFormData(prev => {
          const updated = { ...prev, locationId: newLocationId };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        // --- Fetch latest profile and update contact info ---
        try {
          const userProfile = await AuthService.getCurrentUserProfile();
          const data = userProfile?.data;
          if (data) {
            setFormData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                name: prev.contactInfo.name || data.fullName || data.name || data.userName || '',
                email: prev.contactInfo.email || data.email || '',
                phone: prev.contactInfo.phone || data.phoneNumber || '',
                address: prev.contactInfo.address || data.address || ''
              }
            }));
          }
        } catch (profileError) {
          // Optionally handle profile fetch error
        }
        // --- End profile fetch ---

        // Proceed to next step (Contact & Submit)
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        return;
      } else {
        throw new Error('Failed to create location info');
      }
    } catch (error) {
      console.log('Error saving location info:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save location info. Please try again.',
        life: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
    return;
  }

  // Step 2 and beyond: just advance step if valid
  if (!validateStep(currentStep)) return;
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
      // Only submit contact info
      const contactPayload = {
        reportId: formData.reportId,
        name: formData.contactInfo.name,
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email,
        address: formData.contactInfo.address,
        preferredContact: formData.contactInfo.preferredContact,
        handoverPreference: formData.handoverPreference,
        reward: formData.additionalInfo.reward,
      };
      const contactRes = await ItemsService.createContact(contactPayload);
      if (!contactRes?.data?.id && !contactRes?.data?.data) throw new Error('Failed to create contact');

      // Show success notification
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Report has successfully made!',
        life: 3000
      });

      // Clear report data from localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Redirect to main report page (adjust path if needed)
      navigate('/report');
    } catch (error) {
      console.error('Error submitting contact info:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit contact info. Please try again.',
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
const [filteredCategorySuggestions, setFilteredCategorySuggestions] = useState<Category[]>();

const searchCategorySuggestions = useCallback(
  async (event: any) => {
    const query = event.query?.trim().toLowerCase() || '';
    try {
      const response = await ItemsService.getCategories(10, 1);
      const categoriesArr = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      // Optionally filter on client if needed
      const filtered = query
        ? categoriesArr.filter((cat: any) => cat.name.toLowerCase().includes(query))
        : categoriesArr;
      setFilteredCategorySuggestions(filtered);
    } catch (error) {
      setFilteredCategorySuggestions([]);
    }
  },
  [auth?.token]
);


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
        localStorage.removeItem('publicUserData');
        navigate('/');
      }
    }
  ];

  // Utility: returns true if any top-level field or nested field has a value
const isFormDirty = () => {
  const initial = getInitialFormData();
  for (const key in formData) {
    if (typeof formData[key] === 'object' && formData[key] !== null) {
      for (const subKey in formData[key]) {
        if (formData[key][subKey] !== initial[key][subKey]) return true;
      }
    } else if (formData[key] !== initial[key]) {
      return true;
    }
  }
  return false;
};

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
            suggestions={filteredNameSuggestions}
            completeMethod={searchNameSuggestions}
            field="name"
            onChange={(e) => {
              if (typeof e.value === 'string') {
                setFormData((prev) => ({
                  ...prev,
                  name: e.value,
                  brand: '',
                  model: '',
                  categoryId: 0,
                  category: '', 
                  manufacturer: '',
                  productType: '',
                  itemId: undefined, // Clear itemId if typing a new item
                }));
              } else if (e.value && typeof e.value === 'object') {
                const categoryObj = categories.find(
                  (cat) => String(cat.id) === String(e.value.categoryId)
                );
                setFormData((prev) => ({
                  ...prev,
                  name: e.value.name || '',
                  brand: e.value.brand || '',
                  model: e.value.model || '',
                  categoryId: e.value.categoryId || 0,
                  category: categoryObj?.name || '',
                  manufacturer: e.value.manufacturer || '',
                  productType: e.value.productType || '',
                  itemId: e.value.id, // Set itemId if existing item selected
                }));
              }
            }}
            onSelect={async (e) => {
              const selected = e.value;
              if (selected && typeof selected === 'object') {
                let categoryObj = categories.find(
                  (cat) => String(cat.id) === String(selected.categoryId)
                );
                if (!categoryObj && selected.categoryId) {
                  try {
                    const response = await ItemsService.getCategories(100, 1);
                    const categoriesArr = Array.isArray(response?.data)
                      ? response.data
                      : [];
                    categoryObj = categoriesArr.find(
                      (cat) => String(cat.id) === String(selected.categoryId)
                    );
                    if (categoriesArr.length > 0)
                      setCategories((prev) => {
                        const merged = [...prev];
                        categoriesArr.forEach((c) => {
                          if (!merged.some((m) => m.id === c.id)) merged.push(c);
                        });
                        return merged;
                      });
                  } catch (err) {
                    console.error('Failed to fetch categories', err);
                  }
                }
                setFormData((prev) => ({
                  ...prev,
                  name: selected.name || '',
                  brand: selected.brand || '',
                  model: selected.model || '',
                  categoryId: categoryObj?.id || 0,
                  category: categoryObj?.name || '',
                  manufacturer: selected.manufacturer || '',
                  productType: selected.productType || '',
                  itemId: selected.id,
                }));
              }
            }}
            placeholder="Start typing... e.g., Samsung, iPhone, Wallet..."
            className="w-full"
            dropdown
            minLength={1}
            delay={300}
            emptyMessage="No suggestions found. Type to search common items or enter your custom item."
            itemTemplate={(item: any) => (
              <div>
                <strong>{item.name}</strong>
                {item.brand && (
                  <span style={{ marginLeft: 8, color: '#888' }}>{item.brand}</span>
                )}
                {item.model && (
                  <span style={{ marginLeft: 8, color: '#888' }}>{item.model}</span>
                )}
              </div>
            )}
          />
          <small className="text-gray-500 block mt-1">
            💡 Start typing to see suggestions with auto-category selection, or enter
            your own item
          </small>
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *{' '}
            {(typeof formData.category === 'object' && formData.category !== null && (formData.category as Category).name && formData.name) && (
              <span className="text-green-600 text-xs">
                (Auto-selected for "{formData.name}")
              </span>
            )}
          </label>
          <AutoComplete
            value={formData.category}
            suggestions={filteredCategorySuggestions}
            completeMethod={searchCategorySuggestions}
            field="name"
            dropdown
            placeholder='Select a category'
            forceSelection
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                category: typeof e.value === 'object' && e.value !== null ? e.value.name : e.value,
                categoryId: e.value?.id || 0,
              }));
            }}
            onSelect={(e) => {
              setFormData(prev => ({
                ...prev,
                category: typeof e.value === 'object' && e.value !== null ? e.value.name : e.value,
                categoryId: e.value?.id || 0,
              }));
            }}
          />
        </div>

        {/* Brand */}
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

        {/* Model */}
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

        {/* Show color and condition for found items */}
        {reportType === 'found' && (
          <>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <InputText
                value={formData.color}
                onChange={(e) => updateFormData('color', e.target.value)}
                placeholder="e.g., Blue, Black, Red..."
                className="w-full"
              />
            </div>
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
          </>
        )}

        {/* Description */}
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

        {/* Standard Specs */}
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

        {/* Identifying Features */}
        <div className="col-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identifying Features
          </label>
          <InputTextarea
            value={formData.additionalInfo.identifyingFeatures}
            onChange={(e) =>
              updateFormData('additionalInfo.identifyingFeatures', e.target.value)
            }
            placeholder="Any unique marks, scratches, stickers, engravings, or distinctive features..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Photos */}
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

        {/* Preview */}
        {formData.name &&
        (((typeof formData.category === 'object' && formData.category !== null && (formData.category as Category).name) ||
          (typeof formData.category === 'string' && formData.category)) && (
          <div className="col-12">
            <div className="p-3 bg-blue-50 border-round border-1 border-blue-200">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-info-circle text-blue-600"></i>
                <span className="font-semibold text-blue-800">
                  Item Information Preview
                </span>
              </div>
              <div className="text-sm text-blue-700 grid">
                <div className="col-6">
                  <strong>Name:</strong>{' '}
                  {formData.name || <span className="text-gray-400">Not specified</span>}
                  <br />
                  <strong>Category:</strong>{' '}
                  {formData.category && typeof formData.category === 'object' && (formData.category as Category).name
                    ? (formData.category as Category).name
                    : <span className="text-gray-400">Not specified</span>
                  }{' '}
                  (ID: {formData.categoryId || <span className="text-gray-400">N/A</span>}
                  )
                  <br />
                  <strong>Brand:</strong>{' '}
                  {formData.brand || <span className="text-gray-400">Not specified</span>}
                  <br />
                  <strong>Model:</strong>{' '}
                  {formData.model || <span className="text-gray-400">Not specified</span>}
                </div>
                <div className="col-6">
                  {reportType === 'found' && (
                    <>
                      <strong>Color:</strong>{' '}
                      {formData.color || <span className="text-gray-400">Not specified</span>}
                      <br />
                      <strong>Condition:</strong>{' '}
                      {formData.condition || (
                        <span className="text-gray-400">Not specified</span>
                      )}
                      <br />
                    </>
                  )}
                  <strong>Images:</strong> {formData.images.length} selected
                </div>
              </div>
            </div>
          </div>
        ))}

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
            placeholder={profileSuggestion.name ? `e.g. ${profileSuggestion.name}` : "Full name"}
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
            placeholder={profileSuggestion.phone ? `e.g. ${profileSuggestion.phone}` : "Your phone number"}
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
            placeholder={profileSuggestion.email ? `e.g. ${profileSuggestion.email}` : "Your email address"}
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
  <div
    style={{
      minHeight: '100vh',
      height: '100vh',
      background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
      color: '#ffffff',
      overflow: 'hidden', // Prevent double scrollbars
    }}
  >
    <div className={`${isMobile ? 'p-3' : 'p-6'}`} style={{ height: '100%' }}>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <div className="flex align-items-center justify-content-between mb-4" style={{ flexShrink: 0 }}>
          <Chip
            label={`${reportType === 'lost' ? 'Lost' : 'Found'} Item Report`}
            className={reportType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
          />
          {/* Auth display */}
            <div className="flex align-items-center gap-2">
              <Avatar
                icon="pi pi-user"
                shape="circle"
                style={{ backgroundColor: 'white', color: '#1e40af'}}
              />
              <span className="text-sm text-white font-semibold">
                {auth && auth.userData
                  ? (auth.userData.email || '')
                  : ''}
              </span>
              <Menu
                model={accountMenuItems}
                popup
                ref={accountMenuRef}
                className="mt-2"
                style={{ minWidth: '160px' }}
              />
            {isFormDirty() && (
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-text text-white"
                tooltip="Clear all previous inputs"
                tooltipOptions={{ position: 'top' }}
                onClick={() => setFormData(getInitialFormData())}
                aria-label="Clear all inputs"
              />
            )}
            </div>
        </div>
        {/* Progress */}
        <Card className="mb-4" style={{ flexShrink: 0 }}>
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
        <Card
          className="p-4"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 1)',
          }}
        >
          {currentStep === 0 && renderReportTypeStep()}
          {currentStep === 1 && renderItemDetailsStep()}
          {currentStep === 2 && renderLocationInfoStep()}
          {currentStep === 3 && renderContactStep()}
        </Card>
        {/* Navigation */}
        <div className="flex justify-content-between mt-4" style={{ flexShrink: 0 }}>
          <Button
            label="Previous"
            icon="pi pi-chevron-left"
            className="p-button-outlined color-white"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          />
          {/* Step 1: Show Proceed or Next, never both */}
          {currentStep === 1 ? (
            !itemChecked ? (
              <Button
                label={isSubmitting ? "Checking..." : "Proceed"}
                icon="pi pi-check"
                loading={isSubmitting}
                onClick={handleProceed}
                disabled={!validateStep(currentStep)}
              />
            ) : (
              <Button
                label={isSubmitting ? "Saving..." : "Next"}
                icon="pi pi-chevron-right"
                iconPos="right"
                onClick={handleNext}
                loading={isSubmitting}
                disabled={!validateStep(currentStep)}
              />
            )
          ) : currentStep < steps.length - 1 ? (
            <Button
              label="Next"
              icon="pi pi-chevron-right"
              iconPos="right"
              onClick={handleNext}
              color="white"
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