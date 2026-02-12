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
  maxMembers: 100,
  selectedTier: null,
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
