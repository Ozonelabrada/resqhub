import api from '../api/client';

export interface BackendFeature {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  dateCreated: string;
  lastModifiedDate: string;
}

export interface FeatureResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: {
    features: BackendFeature[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  errors: string[] | null;
}

export interface CommunityType {
  id: string;
  name: string;
  currency: string;
  enabled: boolean;
}

export interface FeaturePrice {
  communityTypeId: string;
  price: number;
  enabled: boolean;
}

export interface Feature {
  id: string | number;
  name: string;
  key: string;
  code: string;
  description: string;
  category?: string;
  enabled: boolean;
  priced?: boolean;
  prices?: FeaturePrice[];
  currency?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastModifiedBy?: string;
}

// API functions
export const appConfigService = {
  async getFeatures(): Promise<Feature[]> {
    try {
      const response = await api.get<FeatureResponse>('/Features?pageSize=50&page=1');
      if (response.data.succeeded && response.data.data.features) {
        return response.data.data.features.map((bf: BackendFeature) => ({
          id: bf.id,
          name: bf.name,
          key: bf.code,
          code: bf.code,
          description: bf.description,
          category: 'General',
          enabled: bf.isActive,
          priced: false,
          prices: [],
          currency: 'PHP',
          createdAt: new Date(bf.dateCreated),
          updatedAt: new Date(bf.lastModifiedDate === '0001-01-01T00:00:00' ? bf.dateCreated : bf.lastModifiedDate),
          lastModifiedBy: 'System',
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch features:', error);
      return [];
    }
  },

  // Mock data fallback - replace with API call

  async getCommunityTypes(): Promise<CommunityType[]> {
    return [
      { id: 'barangay', name: 'Barangay', currency: 'PHP', enabled: true },
      { id: 'city', name: 'City', currency: 'PHP', enabled: true },
      { id: 'school', name: 'School', currency: 'PHP', enabled: true },
      { id: 'organization', name: 'Organization', currency: 'PHP', enabled: true },
      { id: 'event', name: 'Event', currency: 'PHP', enabled: true },
      { id: 'lgu', name: 'LGU', currency: 'PHP', enabled: true },
      { id: 'private', name: 'Private', currency: 'PHP', enabled: true },
    ];
  },

  async getFeaturesForCommunityType(communityType: string): Promise<Feature[]> {
    const allFeatures = await this.getFeatures();
    return allFeatures.filter(feature => 
      feature.enabled && 
      (!feature.priced || (feature.prices && feature.prices.some(p => p.communityTypeId === communityType && p.enabled)))
    );
  },

  async getFeaturePrice(featureKey: string, communityType: string): Promise<number> {
    const features = await this.getFeatures();
    const feature = features.find(f => f.key === featureKey);
    if (!feature || !feature.priced || !feature.prices) return 0;
    const priceData = feature.prices.find(p => p.communityTypeId === communityType);
    return priceData?.price || 0;
  },
};