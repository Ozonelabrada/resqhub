const mapFormDataToApiPayload = (reportType: string, formData: any) => {
//   const userData = localStorage.getItem('publicUserData');
//   const userId = userData ? JSON.parse(userData).id : undefined;
const userId = 'eab75ee8-3ba8-4825-9819-ec1f20104885';
  return {
    userId,
    reportType: reportType === 'lost' ? 1 : 2,
    title: formData.title,
    description: formData.description,
    category: formData.category,
    contactName: formData.contactInfo.name,
    contactPhone: formData.contactInfo.phone,
    contactEmail: formData.contactInfo.email,
    preferredContactMethod: formData.contactInfo.preferredContact === 'phone' ? 1 : formData.contactInfo.preferredContact === 'email' ? 2 : 3,
    incidentLocation: formData.location,
    currentLocation: formData.currentLocation,
    incidentDate: formData.date ? formData.date.toISOString() : undefined,
    incidentTime: formData.time,
    circumstances: formData.additionalInfo.circumstances,
    identifyingFeatures: formData.additionalInfo.identifyingFeatures,
    condition: (() => {
      switch (formData.condition) {
        case 'excellent': return 1;
        case 'good': return 2;
        case 'fair': return 3;
        case 'damaged': return 4;
        default: return 2;
      }
    })(),
    handoverPreference: (() => {
      switch (formData.handoverPreference) {
        case 'meet': return 1;
        case 'pickup': return 2;
        case 'mail': return 3;
        default: return 1;
      }
    })(),
    storageLocation: formData.additionalInfo.storageLocation,
    rewardAmount: formData.additionalInfo.reward ? parseFloat(formData.additionalInfo.reward.replace(/[^0-9.]/g, '')) || 0 : 0,
    rewardDescription: formData.additionalInfo.reward,
    expiresAt: undefined, // Add if you have expiry logic
    imageUrls: [], // You need to upload images separately and get URLs, or handle this as needed
  };
};
export default mapFormDataToApiPayload;
export type { mapFormDataToApiPayload };