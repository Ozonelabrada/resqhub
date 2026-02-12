export type TierType = 'free' | 'basic' | 'pro' | 'enterprise';

export interface SubscriptionTierFeatures {
  liveChat: boolean;
  feedUpdates: boolean;
  newsAndAnnouncements: boolean;
  discussionPosts: boolean;
  events: boolean;
  needsBoard: boolean;
  tradeMarket: boolean;
  incidentReporting: boolean;
  emergencyMap: boolean;
  broadcastAlerts: boolean;
  memberDirectory: boolean;
  skillMatching: boolean;
  equipmentSharing: boolean;
}

export interface SubscriptionTier {
  id?: number;
  type: TierType;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  features: SubscriptionTierFeatures;
  badge?: string;
  instantApproval?: boolean;
  highlightFeatures: string[]; // Features to highlight in the UI
}

// Base tier features for free/sponsored communities
const freeFeatures: SubscriptionTierFeatures = {
  liveChat: true,
  feedUpdates: true,
  newsAndAnnouncements: false,
  discussionPosts: false,
  events: false,
  needsBoard: false,
  tradeMarket: false,
  incidentReporting: false,
  emergencyMap: false,
  broadcastAlerts: false,
  memberDirectory: true,
  skillMatching: false,
  equipmentSharing: false,
};

// Basic tier
const basicFeatures: SubscriptionTierFeatures = {
  ...freeFeatures,
  newsAndAnnouncements: true,
  discussionPosts: true,
  events: true,
  needsBoard: true,
  incidentReporting: true,
};

// Pro tier
const proFeatures: SubscriptionTierFeatures = {
  ...basicFeatures,
  tradeMarket: true,
  emergencyMap: true,
  skillMatching: true,
  equipmentSharing: true,
};

// Enterprise tier - everything
const enterpriseFeatures: SubscriptionTierFeatures = {
  ...proFeatures,
  broadcastAlerts: true,
};

export const SUBSCRIPTION_TIERS: Record<TierType, SubscriptionTier> = {
  free: {
    type: 'free',
    name: 'Sponsored',
    code: 'free',
    description: 'For Barangay Communities - Government Supported',
    monthlyPrice: 0,
    features: freeFeatures,
    badge: 'Government Supported',
    highlightFeatures: ['Live Chat', 'Community Feed', 'Member Directory'],
  },
  basic: {
    type: 'basic',
    name: 'Basic Community Plan',
    code: 'basic',
    description: 'Perfect for communities beginning digital transformation',
    monthlyPrice: 999,
    features: basicFeatures,
    highlightFeatures: ['Events Management', 'Incident Reporting', 'Needs Board', 'Discussion Posts'],
  },
  pro: {
    type: 'pro',
    name: 'Pro Community Plan',
    code: 'pro',
    description: 'For active and growing communities (Most Recommended)',
    monthlyPrice: 2499,
    features: proFeatures,
    badge: 'MOST POPULAR',
    highlightFeatures: ['Emergency Map', 'Trade Market', 'Skill Matching', 'Equipment Sharing'],
  },
  enterprise: {
    type: 'enterprise',
    name: 'Enterprise / LGU Plan',
    code: 'enterprise',
    description: 'For municipalities and large organizations',
    monthlyPrice: 7500,
    features: enterpriseFeatures,
    instantApproval: true,
    badge: 'Enterprise',
    highlightFeatures: ['Broadcast Alerts', 'Advanced Analytics', 'Priority Support'],
  },
};

// Get tier by privacy mode (barangay is always free/sponsored)
export const getTiersByPrivacy = (privacy: string): TierType[] => {
  if (privacy === 'barangay') {
    return ['free'];
  }
  return ['basic', 'pro', 'enterprise'];
};

// Map backend plan to frontend tier
export const mapBackendPlanToTier = (plan: any): SubscriptionTier | null => {
  const codeToType: Record<string, TierType> = {
    'basic': 'basic',
    'pro': 'pro',
    'enterprise': 'enterprise',
  };
  
  const tierType = codeToType[plan.code];
  if (!tierType) {
    console.warn('Unknown plan code:', plan.code);
    return null;
  }
  
  const baseTier = SUBSCRIPTION_TIERS[tierType];
  const mappedTier: SubscriptionTier = {
    ...baseTier,
    id: plan.id,
    type: tierType,
    code: plan.code,
    monthlyPrice: plan.monthlyPrice || baseTier.monthlyPrice,
    name: plan.name || baseTier.name,
    description: plan.description || baseTier.description,
  };
  
  return mappedTier;
};

// Get tier features as boolean flags for backward compatibility
export const tierToFormFeatures = (tier: SubscriptionTier) => {
  return {
    hasLiveChat: tier.features.liveChat,
    hasFeedUpdates: tier.features.feedUpdates,
    hasNewsPosts: tier.features.newsAndAnnouncements,
    hasAnnouncements: tier.features.newsAndAnnouncements,
    hasDiscussionPosts: tier.features.discussionPosts,
    hasIncidentReporting: tier.features.incidentReporting,
    hasEmergencyMap: tier.features.emergencyMap,
    hasBroadcastAlerts: tier.features.broadcastAlerts,
    hasMemberDirectory: tier.features.memberDirectory,
    hasSkillMatching: tier.features.skillMatching,
    hasEquipmentSharing: tier.features.equipmentSharing,
    hasNeedsBoard: tier.features.needsBoard,
    hasTradeMarket: tier.features.tradeMarket,
    hasEvents: tier.features.events,
  };
};
