import type { SubscriptionStatus } from '../../../../services/subscriptionService';

export type Step = 'details' | 'features' | 'review' | 'success';

export type PrivacyMode = 'barangay' | 'city' | 'lgu' | 'school' | 'organization' | 'event' | 'private';

export interface CommunityFormData {
  name: string;
  description: string;
  location: string;
  privacy: PrivacyMode;
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
  maxMembers: number;
}

export const INITIAL_FORM_DATA: CommunityFormData = {
  name: '',
  description: '',
  location: '',
  privacy: 'barangay',
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
  maxMembers: 100,
};

export interface StepProps {
  formData: CommunityFormData;
  setFormData: (data: CommunityFormData) => void;
  onNext: () => void;
  onBack?: () => void;
  onClose?: () => void;
  subStatus?: SubscriptionStatus;
}
