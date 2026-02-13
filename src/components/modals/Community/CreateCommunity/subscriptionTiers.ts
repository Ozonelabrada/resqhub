import { SubscriptionService, type SubscriptionPlan } from '../../../../services/subscriptionService';

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
  id: number;
  type: TierType;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  annualPrice?: number;
  features: SubscriptionTierFeatures | string[]; // Can be features object or array of feature strings
  badge?: string;
  instantApproval?: boolean;
  highlightFeatures: string[]; // Features to highlight in the UI
  status?: string;
  isActive?: boolean;
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

// Fetch real subscription plans from API
export async function getRealSubscriptionTiers(): Promise<SubscriptionTier[]> {
  try {
    const plans = await SubscriptionService.getPlans(true, 1, 100);
    
    return plans
      .filter(plan => plan.isActive)
      .map(plan => {
        const type = (plan.code as TierType) || 'basic';
        
        // Map feature strings to highlight features
        const highlightFeatures = mapFeaturesToHighlights(plan.features, type);
        
        return {
          id: plan.id,
          type,
          name: plan.name,
          code: plan.code,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          features: plan.features, // Keep original feature array
          status: plan.status,
          isActive: plan.isActive,
          badge: type === 'pro' ? 'POPULAR' : type === 'enterprise' ? 'ENTERPRISE' : undefined,
          instantApproval: type === 'free',
          highlightFeatures,
        };
      })
      .sort((a, b) => a.monthlyPrice - b.monthlyPrice); // Sort by price ascending
  } catch (error) {
    return getDefaultSubscriptionTiers(); // Fallback to defaults
  }
}

// Map feature codes to human-readable highlights
function mapFeaturesToHighlights(features: string[], tierType: TierType): string[] {
  const featureMap: Record<string, string> = {
    'official_community_page': 'Official Page',
    'announcements_news_events': 'News & Events',
    'member_registration_management': 'Member Management',
    'lost_found_reporting': 'Lost & Found',
    'advanced_analytics_dashboard': 'Analytics',
    'local_marketplace': 'Marketplace',
    'local_services_directory': 'Services Directory',
    'community_verification_badge': 'Verification Badge',
    'multi_barangay_management': 'Multi-Barangay',
    'emergency_alert_broadcasting': 'Emergency Alerts',
    'custom_branding': 'Custom Branding',
    'dedicated_support': 'Priority Support',
  };

  let highlights: string[] = [];
  
  if (Array.isArray(features)) {
    highlights = features
      .slice(0, 4) // Top 4 features
      .map(f => featureMap[f] || f)
      .filter(Boolean);
  }

  // Fallback highlights by tier
  if (highlights.length === 0) {
    switch (tierType) {
      case 'basic':
        highlights = ['Member Management', 'News & Events'];
        break;
      case 'pro':
        highlights = ['Marketplace', 'Analytics', 'Verification Badge', 'Priority Support'];
        break;
      case 'enterprise':
        highlights = ['Emergency Alerts', 'Multi-Barangay', 'Custom Branding', 'Dedicated Support'];
        break;
      default:
        highlights = ['Live Chat', 'Member Directory'];
    }
  }

  return highlights;
}

// Default subscription tiers (fallback if API fails)
export function getDefaultSubscriptionTiers(): SubscriptionTier[] {
  return [
    {
      id: 0,
      type: 'free',
      name: 'Free',
      code: 'free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      features: freeFeatures,
      instantApproval: true,
      highlightFeatures: ['Live Chat', 'Member Directory'],
    },
    {
      id: 1,
      type: 'basic',
      name: 'Basic Community Plan',
      code: 'basic',
      description: 'Perfect for communities beginning digital transformation',
      monthlyPrice: 999,
      annualPrice: 10000,
      features: [],
      highlightFeatures: ['Member Management', 'News & Events'],
    },
    {
      id: 2,
      type: 'pro',
      name: 'Pro Community Plan',
      code: 'pro',
      description: 'For active and growing communities (Most Recommended)',
      monthlyPrice: 2499,
      annualPrice: 25000,
      features: [],
      badge: 'POPULAR',
      highlightFeatures: ['Marketplace', 'Analytics', 'Verification Badge', 'Priority Support'],
    },
    {
      id: 3,
      type: 'enterprise',
      name: 'Enterprise / LGU Plan',
      code: 'enterprise',
      description: 'For municipalities and large organizations',
      monthlyPrice: 7500,
      annualPrice: 75000,
      features: [],
      badge: 'ENTERPRISE',
      highlightFeatures: ['Emergency Alerts', 'Multi-Barangay', 'Custom Branding', 'Dedicated Support'],
    },
  ];
}

// Lazy-loaded subscription tiers (cached)
let cachedTiers: SubscriptionTier[] | null = null;
export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  if (cachedTiers) {
    return cachedTiers;
  }
  
  cachedTiers = await getRealSubscriptionTiers();
  return cachedTiers;
}

// Export SUBSCRIPTION_TIERS for backward compatibility (defaults)
export const SUBSCRIPTION_TIERS = getDefaultSubscriptionTiers();

// Get tier by privacy mode (barangay is always free/sponsored)
export const getTiersByPrivacy = (privacy: string): TierType[] => {
  if (privacy === 'barangay') {
    return ['free'];
  }
  return ['basic', 'pro', 'enterprise'];
};

// Map backend plan to frontend tier (converts API response to UI format)
export const mapBackendPlanToTier = (plan: SubscriptionPlan): SubscriptionTier => {
  const type = (plan.code as TierType) || 'basic';
  const highlightFeatures = mapFeaturesToHighlights(plan.features, type);
  
  return {
    id: plan.id,
    type,
    name: plan.name,
    code: plan.code,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    features: plan.features, // Keep original feature array
    status: plan.status,
    isActive: plan.isActive,
    badge: type === 'pro' ? 'POPULAR' : type === 'enterprise' ? 'ENTERPRISE' : undefined,
    instantApproval: type === 'free',
    highlightFeatures,
  };
};

// Get tier features as boolean flags for backward compatibility
export const tierToFormFeatures = (tier: SubscriptionTier) => {
  // Handle features as either object (legacy) or array (new)
  const features = typeof tier.features === 'object' && !Array.isArray(tier.features) 
    ? tier.features as SubscriptionTierFeatures
    : freeFeatures; // Default to free features if array

  return {
    hasLiveChat: features.liveChat ?? false,
    hasFeedUpdates: features.feedUpdates ?? false,
    hasNewsPosts: features.newsAndAnnouncements ?? false,
    hasAnnouncements: features.newsAndAnnouncements ?? false,
    hasDiscussionPosts: features.discussionPosts ?? false,
    hasIncidentReporting: features.incidentReporting ?? false,
    hasEmergencyMap: features.emergencyMap ?? false,
    hasBroadcastAlerts: features.broadcastAlerts ?? false,
    hasMemberDirectory: features.memberDirectory ?? false,
    hasSkillMatching: features.skillMatching ?? false,
    hasEquipmentSharing: features.equipmentSharing ?? false,
    hasNeedsBoard: features.needsBoard ?? false,
    hasTradeMarket: features.tradeMarket ?? false,
    hasEvents: features.events ?? false,
  };
};
