import api from '../api/client';

export interface BackendFeature {
  id: number;
  name: string;
  code: string;
  description: string;
  type?: string;
  isActive: boolean;
  monthlyPrice?: number | null;
  oneTimePrice?: number | null;
  dateCreated: string;
  lastModifiedDate: string;
}

export interface BackendPlan {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  recommended?: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
  dateCreated?: string;
  lastModifiedDate?: string;
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

export interface PlansResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: {
    plans: BackendPlan[];
    totalCount: number;
    totalPages: number;
    page: number;
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
  type?: string;
  category?: string;
  enabled: boolean;
  priced?: boolean;
  monthlyPrice?: number | null;
  oneTimePrice?: number | null;
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
      const response = await api.get<FeatureResponse>('/Features?type=feature&pageSize=50&page=1');
      if (response.data.succeeded && response.data.data.features) {
        return response.data.data.features.map((bf: BackendFeature) => ({
          id: bf.id,
          name: bf.name,
          key: bf.code,
          code: bf.code,
          description: bf.description,
          type: bf.type || 'feature',
          category: 'General',
          enabled: bf.isActive,
          priced: bf.monthlyPrice !== null || bf.oneTimePrice !== null,
          monthlyPrice: bf.monthlyPrice,
          oneTimePrice: bf.oneTimePrice,
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

  async getAddOns(): Promise<Feature[]> {
    try {
      const response = await api.get<FeatureResponse>('/Features?type=addOns&pageSize=50&page=1');
      if (response.data.succeeded && response.data.data.features) {
        return response.data.data.features.map((bf: BackendFeature) => ({
          id: bf.id,
          name: bf.name,
          key: bf.code,
          code: bf.code,
          description: bf.description,
          type: bf.type || 'addon',
          category: 'Add-on',
          enabled: bf.isActive,
          priced: bf.monthlyPrice !== null || bf.oneTimePrice !== null,
          monthlyPrice: bf.monthlyPrice,
          oneTimePrice: bf.oneTimePrice,
          prices: [],
          currency: 'PHP',
          createdAt: new Date(bf.dateCreated),
          updatedAt: new Date(bf.lastModifiedDate === '0001-01-01T00:00:00' ? bf.dateCreated : bf.lastModifiedDate),
          lastModifiedBy: 'System',
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch add-ons:', error);
      return [];
    }
  },

  async getPlans(
    isActive = true,
    page = 1,
    pageSize = 10
  ): Promise<BackendPlan[]> {
    try {
      const response = await api.get<PlansResponse>(
        `/plans?isActive=${isActive}&page=${page}&pageSize=${pageSize}`
      );
      if (response.data.succeeded && response.data.data.plans) {
        return response.data.data.plans;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      return [];
    }
  },

  async createPlan(planData: {
    name: string;
    code: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    notes?: string;
    features: string[];
  }): Promise<any> {
    try {
      const response = await api.post('/Plans', planData);
      return response.data;
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  },

  async updatePlan(
    planId: string,
    planData: {
      name: string;
      code: string;
      description: string;
      monthlyPrice: number;
      annualPrice: number;
      notes?: string;
      features: string[];
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/Plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error('Failed to update plan:', error);
      throw error;
    }
  },

  async deletePlan(planId: string): Promise<any> {
    try {
      const response = await api.delete(`/Plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete plan:', error);
      throw error;
    }
  },

  async seedPlans(): Promise<any> {
    try {
      const response = await api.post('/plans/seed', {});
      return response.data;
    } catch (error) {
      console.error('Failed to seed plans:', error);
      throw error;
    }
  },

  async seedFeatures(): Promise<any> {
    try {
      const response = await api.post('/Features/seed', {});
      return response.data;
    } catch (error) {
      console.error('Failed to seed features:', error);
      throw error;
    }
  },

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
