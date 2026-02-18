import type { SubscriptionStatus } from '../../../../services/subscriptionService';
import type { TierType } from './subscriptionTiers';

export type Step = 'details' | 'tier' | 'review' | 'success';

export type PrivacyMode = 'barangay' | 'city' | 'lgu' | 'school' | 'organization' | 'event' | 'private';

export interface CommunityFormData {
  name: string;
  description: string;
  location: string;
  privacy: PrivacyMode;
  imageUrl?: string | null;
  maxMembers: number;
  selectedTier: TierType | null;
  planId: number | null; // Backend plan ID
  parentId: number; // Parent community ID (0 for root communities)
  billingType: 'monthly' | 'yearly';
  selectedAddOns: string[]; // Array of add-on codes
  paymentType: 'monthly' | 'yearly';
  totalAmount: number;
  // UI-driven feature list (used by FeaturesStep)
  features: Array<{ code: string; isActive: boolean; label?: string }>;
  // Legacy boolean fields (for backend compatibility & pricing calculation)
  hasLiveChat: boolean;
  hasFeedUpdates: boolean;
  hasNewsPosts: boolean;
  hasAnnouncements: boolean;
  hasDiscussionPosts: boolean;
  hasIncidentReporting: boolean;
  hasEmergencyMap: boolean;
  hasBroadcastAlerts: boolean;
  hasMemberDirectory: boolean;
  hasSkillMatching: boolean;
  hasEquipmentSharing: boolean;
  hasNeedsBoard: boolean;
  hasTradeMarket: boolean;
  hasEvents: boolean;
}

export const INITIAL_FORM_DATA: CommunityFormData = {
  name: '',
  description: '',
  location: '',
  privacy: 'barangay',
  imageUrl: '',
  maxMembers: 10000, // Barangay gets unlimited members by default
  selectedTier: null,
  planId: null,
  parentId: 0, // Root community by default
  billingType: 'monthly',
  selectedAddOns: [],
  paymentType: 'monthly',
  totalAmount: 0,
  // UI feature list (mirrors legacy boolean flags for the wizard)
  features: [
    { code: 'live_chat', isActive: false },
    { code: 'feed_updates', isActive: false },
    { code: 'news_posts', isActive: false },
    { code: 'announcements', isActive: false },
    { code: 'discussion_posts', isActive: false },
    { code: 'incident_reporting', isActive: false },
    { code: 'emergency_map', isActive: false },
    { code: 'broadcast_alerts', isActive: false },
    { code: 'member_directory', isActive: false },
    { code: 'skill_matching', isActive: false },
    { code: 'equipment_sharing', isActive: false },
    { code: 'needs_board', isActive: false },
    { code: 'trade_market', isActive: false },
    { code: 'events', isActive: false },
  ],
  // Legacy fields (will be populated when tier is selected)
  hasLiveChat: false,
  hasFeedUpdates: false,
  hasNewsPosts: false,
  hasAnnouncements: false,
  hasDiscussionPosts: false,
  hasIncidentReporting: false,
  hasEmergencyMap: false,
  hasBroadcastAlerts: false,
  hasMemberDirectory: false,
  hasSkillMatching: false,
  hasEquipmentSharing: false,
  hasNeedsBoard: false,
  hasTradeMarket: false,
  hasEvents: false,
};

export interface StepProps {
  formData: CommunityFormData;
  setFormData: (data: CommunityFormData) => void;
  onNext: () => void;
  onBack?: () => void;
  onClose?: () => void;
  subStatus?: SubscriptionStatus;
}
