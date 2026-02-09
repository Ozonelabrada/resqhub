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
  async getFeaturesLegacy(): Promise<Feature[]> {
    return [
      {
        id: '1',
        name: 'Live Chat',
        key: 'hasLiveChat',
        code: 'hasLiveChat',
        description: 'Real-time messaging for community members',
        category: 'Social',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 250, enabled: true },
          { communityTypeId: 'school', price: 250, enabled: true },
          { communityTypeId: 'organization', price: 250, enabled: true },
          { communityTypeId: 'event', price: 250, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '2',
        name: 'Feed Updates',
        key: 'hasFeedUpdates',
        code: 'hasFeedUpdates',
        description: 'News feed with posts, announcements, and discussions',
        category: 'Social',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 150, enabled: true },
          { communityTypeId: 'school', price: 150, enabled: true },
          { communityTypeId: 'organization', price: 150, enabled: true },
          { communityTypeId: 'event', price: 150, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      // Add all features from the list
      {
        id: '3',
        name: 'Events',
        key: 'hasEvents',
        code: 'hasEvents',
        description: 'Event management and scheduling',
        category: 'Social',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 100, enabled: true },
          { communityTypeId: 'school', price: 100, enabled: true },
          { communityTypeId: 'organization', price: 100, enabled: true },
          { communityTypeId: 'event', price: 100, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '4',
        name: 'Needs Board',
        key: 'hasNeedsBoard',
        code: 'hasNeedsBoard',
        description: 'Community needs and assistance board',
        category: 'Economy',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 200, enabled: true },
          { communityTypeId: 'school', price: 200, enabled: true },
          { communityTypeId: 'organization', price: 200, enabled: true },
          { communityTypeId: 'event', price: 200, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '5',
        name: 'Trade Market',
        key: 'hasTradeMarket',
        code: 'hasTradeMarket',
        description: 'Local trade and marketplace',
        category: 'Economy',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 300, enabled: true },
          { communityTypeId: 'school', price: 300, enabled: true },
          { communityTypeId: 'organization', price: 300, enabled: true },
          { communityTypeId: 'event', price: 300, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '6',
        name: 'Incident Reporting',
        key: 'hasIncidentReporting',
        code: 'hasIncidentReporting',
        description: 'Emergency incident reporting system',
        category: 'Safety',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 500, enabled: true },
          { communityTypeId: 'school', price: 500, enabled: true },
          { communityTypeId: 'organization', price: 500, enabled: true },
          { communityTypeId: 'event', price: 500, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '7',
        name: 'Emergency Map',
        key: 'hasEmergencyMap',
        code: 'hasEmergencyMap',
        description: 'Interactive emergency mapping',
        category: 'Safety',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '8',
        name: 'Broadcast Alerts',
        key: 'hasBroadcastAlerts',
        code: 'hasBroadcastAlerts',
        description: 'Emergency broadcast alert system',
        category: 'Safety',
        enabled: false,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 1000, enabled: true },
          { communityTypeId: 'school', price: 1000, enabled: true },
          { communityTypeId: 'organization', price: 1000, enabled: true },
          { communityTypeId: 'event', price: 1000, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '9',
        name: 'Member Directory',
        key: 'hasMemberDirectory',
        code: 'hasMemberDirectory',
        description: 'Community member directory',
        category: 'Members Resources',
        enabled: true,
        priced: true,
        prices: [
          { communityTypeId: 'barangay', price: 0, enabled: true },
          { communityTypeId: 'city', price: 150, enabled: true },
          { communityTypeId: 'school', price: 150, enabled: true },
          { communityTypeId: 'organization', price: 150, enabled: true },
          { communityTypeId: 'event', price: 150, enabled: true },
        ],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '10',
        name: 'Skill Matching',
        key: 'hasSkillMatching',
        code: 'hasSkillMatching',
        description: 'Skill-based member matching',
        category: 'Members Resources',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '11',
        name: 'Equipment Sharing',
        key: 'hasEquipmentSharing',
        code: 'hasEquipmentSharing',
        description: 'Equipment sharing platform',
        category: 'Members Resources',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '12',
        name: 'News Posts',
        key: 'hasNewsPosts',
        code: 'hasNewsPosts',
        description: 'News posting capability',
        category: 'Social',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '13',
        name: 'Announcements',
        key: 'hasAnnouncements',
        code: 'hasAnnouncements',
        description: 'Community announcements',
        category: 'Social',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
      {
        id: '14',
        name: 'Discussions',
        key: 'hasDiscussionPosts',
        code: 'hasDiscussionPosts',
        description: 'Discussion forums',
        category: 'Social',
        enabled: true,
        priced: false,
        prices: [],
        currency: 'PHP',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'Admin User',
      },
    ];
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