import { authManager } from './sessionManager';

// Type definition for form data
interface FormDataPayload {
  name?: string;
  title?: string;
  description?: string;
  condition?: string;
  handoverPreference?: string;
  location?: string;
  currentLocation?: string;
  date?: Date;
  time?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  contactInfo: {
    name: string;
    phone?: string;
    email?: string;
    preferredContact?: string;
  };
  additionalInfo: {
    identifyingFeatures?: string;
    reward?: string;
    storageLocation?: string;
    circumstances?: string;
  };
  standardSpecs?: string;
  images?: File[];
}

interface ReportPayload {
  userId: string;
  reportType: 'Lost' | 'Found';
  title: string;
  description: string;
  expiresAt: string;
  reportItemDetailsId: number;
  reportContactInfoId: number;
  reportLocationDetailsId: number;
}

interface ItemDetailsPayload {
  reportId: number;
  itemId: number;
  description: string;
  color?: string;
  size?: string;
  condition?: number;
  serialNumber?: string;
  distinguishingMarks: string;
  estimatedValue?: number;
  handoverPreference?: number;
  storageLocation: string;
  rewardAmount?: number;
  rewardNotes: string;
  imageUrls: string[];
}

interface ContactInfoPayload {
  reportId: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  preferredContactMethod?: number;
}

const mapFormDataToApiPayload = (reportType: string, formData: FormDataPayload) => {
  // Get the current user ID
  const getCurrentUserId = (): string => {
    const user = authManager.getUser();
    if (user && user.id) {
      return String(user.id);
    }
    throw new Error('User not authenticated. Please sign in to create a report.');
  };

  const userId = getCurrentUserId();

  // Main report payload
  const reportPayload: ReportPayload = {
    userId,
    reportType: reportType.toLowerCase() === 'lost' ? 'Lost' : 'Found',
    title: formData.name || formData.title || '',
    description: formData.description || '',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    reportItemDetailsId: 0, // Will be set after creating item details
    reportContactInfoId: 0, // Will be set after creating contact info
    reportLocationDetailsId: 0 // Will be set after creating location details
  };

  // Report Item Details payload
  const itemDetailsPayload: ItemDetailsPayload = {
    reportId: 0, // Will be set after creating the main report
    itemId: 0, // Not using separate items API anymore
    description: formData.description || '',
    color: extractColorFromDescription(formData.description || '', formData.additionalInfo?.identifyingFeatures || ''),
    size: extractSizeFromDescription(formData.description || '', formData.additionalInfo?.identifyingFeatures || ''),
    condition: getConditionId(formData.condition || ''),
    serialNumber: extractSerialNumber(formData.standardSpecs || ''),
    distinguishingMarks: formData.additionalInfo?.identifyingFeatures || '',
    estimatedValue: extractEstimatedValue(formData.additionalInfo?.reward || ''),
    handoverPreference: reportType.toLowerCase() === 'found' ? getHandoverPreferenceId(formData.handoverPreference || '') : 1,
    storageLocation: formData.additionalInfo?.storageLocation || '',
    rewardAmount: extractRewardAmount(formData.additionalInfo?.reward || ''),
    rewardNotes: formData.additionalInfo?.reward || '',
    imageUrls: [] // Will be populated after image upload if implemented
  };

  // Report Contact Info payload
  const contactInfoPayload: ContactInfoPayload = {
    reportId: 0, // Will be set after creating the main report
    contactName: formData.contactInfo?.name || '',
    contactPhone: formData.contactInfo?.phone || '',
    contactEmail: formData.contactInfo?.email || '',
    preferredContactMethod: formData.contactInfo?.preferredContact ? getContactMethodId(formData.contactInfo.preferredContact) : 1
  };

  // Report Location Details payload
  const locationDetailsPayload = {
    reportId: 0, // Will be set after creating the main report
    incidentLocation: formData.location || "",
    currentLocation: formData.currentLocation || "",
    incidentDate: formData.date ? formData.date.toISOString() : new Date().toISOString(),
    incidentTime: formData.time || "",
    circumstances: formData.additionalInfo?.circumstances || "",
    latitude: formData.latitude || 0,
    longitude: formData.longitude || 0,
    city: formData.city || "",
    state: formData.state || "",
    country: formData.country || ""
  };

  return {
    reportPayload,
    itemDetailsPayload,
    contactInfoPayload,
    locationDetailsPayload
  };
};

// Updated helper functions based on backend enums
const getConditionId = (condition: string): number => {
  switch (condition) {
    case 'new': return 1;        // New = 1
    case 'excellent': return 2;  // Excellent = 2  
    case 'good': return 3;       // Good = 3
    case 'fair': return 4;       // Fair = 4
    case 'poor': return 5;       // Poor = 5
    case 'damaged': return 6;    // Damaged = 6
    default: return 3;           // Default to Good
  }
};

const getContactMethodId = (method: string): number => {
  switch (method) {
    case 'phone': return 1;      // Phone = 1
    case 'email': return 2;      // Email = 2
    case 'both': return 3;       // Both = 3
    case 'sms': return 4;        // SMS = 4
    case 'inapp': return 5;      // InApp = 5
    default: return 1;           // Default to Phone
  }
};

const getHandoverPreferenceId = (preference: string): number => {
  switch (preference) {
    case 'meet': return 1;           // MeetInPerson = 1
    case 'pickup': return 2;         // PickupFromLocation = 2
    case 'mail': return 3;           // Mail = 3
    case 'courier': return 4;        // Courier = 4
    case 'dropoff': return 5;        // DropOff = 5
    case 'policestation': return 6;  // PoliceStation = 6
    default: return 1;               // Default to MeetInPerson
  }
};

const extractRewardAmount = (rewardText: string): number => {
  if (!rewardText) return 0;
  
  const match = rewardText.match(/\$?(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : 0;
};

const extractEstimatedValue = (rewardText: string): number => {
  // For now, use reward amount as estimated value
  // This could be enhanced to parse different patterns
  return extractRewardAmount(rewardText);
};

const extractColorFromDescription = (description: string, features: string): string => {
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'grey', 'brown', 'pink', 'purple', 'orange', 'silver', 'gold'];
  const text = `${description} ${features}`.toLowerCase();
  
  for (const color of colorKeywords) {
    if (text.includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  
  return "";
};

const extractSizeFromDescription = (description: string, features: string): string => {
  const sizeKeywords = ['small', 'medium', 'large', 'xl', 'xs', 'tiny', 'huge', 'big'];
  const text = `${description} ${features}`.toLowerCase();
  
  for (const size of sizeKeywords) {
    if (text.includes(size)) {
      return size.charAt(0).toUpperCase() + size.slice(1);
    }
  }
  
  return "";
};

const extractSerialNumber = (specs: string): string => {
  if (!specs) return "";
  
  // Look for common serial number patterns
  const serialPatterns = [
    /serial[:\s]*([A-Z0-9-]+)/i,
    /s\/n[:\s]*([A-Z0-9-]+)/i,
    /model[:\s]*([A-Z0-9-]+)/i
  ];
  
  for (const pattern of serialPatterns) {
    const match = specs.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return "";
};

export default mapFormDataToApiPayload;
export type { mapFormDataToApiPayload };