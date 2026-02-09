import type { SubscriptionStatus } from '../../../../services/subscriptionService';

export type Step = 'plans' | 'details' | 'addons' | 'review' | 'success';

export type PrivacyMode = 'barangay' | 'city' | 'lgu' | 'school' | 'organization' | 'event' | 'private';

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  name: string;
  description: string;
  available: boolean;
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
}

export interface AddOnModule {
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  oneTimePrice?: number;
  isSelected: boolean;
}

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
  
  // Subscription related
  selectedPlan: SubscriptionPlan;
  billingCycle: BillingCycle;
  addOns: AddOnModule[];
  
  // Organization details
  organizationType?: 'barangay' | 'hoa' | 'school' | 'organization' | 'business' | 'lgu' | 'event' | 'city' | 'private' | string;
  contactEmail?: string;
  contactPhone?: string;
  
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

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, Plan> = {
  basic: {
    id: 'basic',
    name: 'Basic Community Plan',
    monthlyPrice: 999,
    annualPrice: 10000,
    description: 'Perfect for communities beginning digital transformation',
    features: [
      { name: 'Official Community Page', description: '', available: true },
      { name: 'Announcements, News & Events', description: '', available: true },
      { name: 'Member Registration & Management', description: '', available: true },
      { name: 'Lost & Found Reporting', description: '', available: true },
      { name: 'Basic Analytics Dashboard', description: '', available: true },
      { name: 'Local Marketplace', description: '', available: false },
      { name: 'Local Services Directory', description: '', available: false },
      { name: 'Community Verification Badge', description: '', available: false },
      { name: 'Advanced Analytics', description: '', available: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Community Plan',
    monthlyPrice: 2499,
    annualPrice: 25000,
    description: 'For active and growing communities (Most Recommended)',
    recommended: true,
    features: [
      { name: 'Official Community Page', description: '', available: true },
      { name: 'Announcements, News & Events', description: '', available: true },
      { name: 'Member Registration & Management', description: '', available: true },
      { name: 'Lost & Found Reporting', description: '', available: true },
      { name: 'Basic Analytics Dashboard', description: '', available: true },
      { name: 'Local Marketplace', description: 'Buy & sell locally', available: true },
      { name: 'Local Services Directory', description: '', available: true },
      { name: 'Community Verification Badge', description: '', available: true },
      { name: 'Priority Support', description: '', available: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise / LGU Plan',
    monthlyPrice: 7500,
    annualPrice: 75000,
    description: 'For municipalities and large organizations',
    features: [
      { name: 'Official Community Page', description: '', available: true },
      { name: 'Announcements, News & Events', description: '', available: true },
      { name: 'Member Registration & Management', description: '', available: true },
      { name: 'Lost & Found Reporting', description: '', available: true },
      { name: 'Advanced Analytics Dashboard', description: '', available: true },
      { name: 'Local Marketplace', description: 'Buy & sell locally', available: true },
      { name: 'Local Services Directory', description: '', available: true },
      { name: 'Community Verification Badge', description: '', available: true },
      { name: 'Multi-Barangay Management', description: '', available: true },
      { name: 'Emergency Alert Broadcasting', description: '', available: true },
      { name: 'Custom Branding', description: '', available: true },
      { name: 'Dedicated Support', description: '', available: true },
    ],
  },
};

export const ADD_ON_MODULES: AddOnModule[] = [
  {
    code: 'sms_alerts',
    name: 'SMS Emergency Alert System',
    description: 'Send emergency SMS alerts to community members',
    monthlyPrice: 1500,
    isSelected: false,
  },
  {
    code: 'featured_promotions',
    name: 'Featured Business Promotions',
    description: 'Highlight business listings and promotions',
    monthlyPrice: 1500,
    isSelected: false,
  },
  {
    code: 'event_ticketing',
    name: 'Event Ticketing Module',
    description: 'Sell tickets for community events',
    monthlyPrice: 1000,
    isSelected: false,
  },
  {
    code: 'job_board',
    name: 'Community Job & Hiring Board',
    description: 'Post jobs and connect with workers',
    monthlyPrice: 1200,
    isSelected: false,
  },
  {
    code: 'training_workshops',
    name: 'Training & Onboarding Workshops',
    description: 'Premium training and setup assistance',
    monthlyPrice: 5000,
    oneTimePrice: 5000,
    isSelected: false,
  },
];

export const INITIAL_FORM_DATA: CommunityFormData = {
  name: '',
  description: '',
  location: '',
  privacy: 'barangay',
  imageUrl: '',
  maxMembers: 100,
  selectedPlan: 'pro',
  billingCycle: 'annual',
  organizationType: 'barangay',
  contactEmail: '',
  contactPhone: '',
  addOns: ADD_ON_MODULES.map(addon => ({ ...addon })),
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
