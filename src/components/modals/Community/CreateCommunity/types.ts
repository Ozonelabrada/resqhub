import type { SubscriptionStatus } from '../../../../services/subscriptionService';

export type Step = 'details' | 'features' | 'review' | 'success';

export type PrivacyMode = 'barangay' | 'city' | 'lgu' | 'school' | 'organization' | 'event' | 'private';

export interface Feature {
  code: string;
  isActive: boolean;
}

export interface CommunityFormData {
  name: string;
  description: string;
  location: string;
  privacy: PrivacyMode;
  imageUrl?: string | null;
  maxMembers: number;
  features: Feature[];
  // Legacy boolean fields (for UI compatibility)
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
  maxMembers: 100,
  features: [
    { code: 'live_chat', isActive: true },
    { code: 'feed_updates', isActive: true },
    { code: 'news_posts', isActive: true },
    { code: 'announcements', isActive: true },
    { code: 'discussion_posts', isActive: true },
    { code: 'incident_reporting', isActive: true },
    { code: 'emergency_map', isActive: true },
    { code: 'broadcast_alerts', isActive: false },
    { code: 'member_directory', isActive: true },
    { code: 'skill_matching', isActive: false },
    { code: 'equipment_sharing', isActive: false },
    { code: 'needs_board', isActive: false },
    { code: 'trade_market', isActive: false },
    { code: 'events', isActive: false },
  ],
  // Legacy fields
  hasLiveChat: true,
  hasFeedUpdates: true,
  hasNewsPosts: true,
  hasAnnouncements: true,
  hasDiscussionPosts: true,
  hasIncidentReporting: true,
  hasEmergencyMap: true,
  hasBroadcastAlerts: false,
  hasMemberDirectory: true,
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
