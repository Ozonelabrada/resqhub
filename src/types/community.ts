export interface Community {
  id: string | number;
  name: string;
  tagline?: string;
  description: string;
  logo?: string;
  imageUrl?: string | null;
  banner?: string;
  membersCount?: number;
  memberCount?: number;
  location?: string;
  rules?: string[];
  foundedDate?: string;
  dateCreated?: string;
  createdBy?: string;
  status?: string; // 'active' | 'pending' | 'denied' | 'disabled' | etc.
  maxMembers?: number | null;
  isMember?: boolean | string; // Can be boolean or string ('true'/'false') from API
  memberIsApproved?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  isPrivate?: boolean;
  communityUserRoles?: string[]; // e.g., ["member", "admin", "moderator"]
  resources?: Array<{
    id?: string | number;
    title: string;
    description?: string;
    url?: string;
    type?: string; // e.g., 'link', 'file', 'document'
  }>;
  // Feature Flags
  hasLiveChat?: boolean;
  hasFeedUpdates?: boolean;
  hasNewsPosts?: boolean;
  hasAnnouncements?: boolean;
  hasDiscussionPosts?: boolean;
  // New Response Features
  hasIncidentReporting?: boolean;
  hasEmergencyMap?: boolean;
  hasBroadcastAlerts?: boolean;
  // New Resource Features
  hasMemberDirectory?: boolean;
  hasSkillMatching?: boolean;
  hasEquipmentSharing?: boolean;
  hasNeedsBoard?: boolean;
  hasTradeMarket?: boolean;
  hasEvents?: boolean;
}

export interface CommunityPost {
  id: number;
  userId: string;
  reportType: string;
  status: string;
  title: string;
  description: string;
  location: string;
  contactInfo: string;
  rewardDetails: string | null;
  privacy?: 'community' | 'internal';
  categoryId: number | null;
  categoryName: string | null;
  communityId: number;
  communityName: string;
  verificationStatus: string;
  isFeatured: boolean;
  expiresAt: string | null;
  resolvedAt: string | null;
  reactionsCount: number;
  isReacted?: boolean;
  commentsCount: number;
  images: Array<{
    id: number;
    reportId: number;
    imageUrl: string;
    description: string | null;
    dateCreated: string;
  }>;
  user: {
    id: string;
    username: string;
    profilePicture: string | null;
    fullName: string;
  };
  dateCreated: string;
  lastModifiedDate: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'moderator' | 'member';
  roles?: string[]; // All roles for the member (e.g., ["member", "admin"])
  joinedAt: string;
  profilePicture?: string;
  isSeller?: boolean;
  isVolunteer?: boolean; // Whether member is a volunteer
  memberIsApproved?: boolean;
}

export interface JoinRequest {
  id: number;
  userId: string;
  userName: string;
  userFullName: string;
  userEmail?: string;
  profilePictureUrl?: string;
  communityId: number;
  dateCreated: string;
  status: 'Pending' | 'Approved' | 'Denied';
  // Admin review fields
  userAddress?: string;
  userPhone?: string;
  userAge?: number;
  userSex?: string;
  userLocation?: string;
  requestMessage?: string;
  verificationStatus?: string;
}

export type CommunityContentType = 'announcement' | 'news' | 'events';
export type CommunityContentCategory = 'community' | 'announcement' | 'news' | 'event';

export interface CommunityAnnouncement {
  id?: string | number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reportUrl?: string;
  category: CommunityContentCategory;
  type: CommunityContentType;
  location: string;
  contactInfo: string;
  communityId: number | string;
  createdAt?: string;
  createdBy?: string;
  dateCreated?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  isActive?: boolean;
}

export interface CommunityNews extends CommunityAnnouncement {
  type: 'news';
}

export interface CommunityEvent extends CommunityAnnouncement {
  type: 'events';
}

export interface CalendarEvent {
  title: string;
  description: string;
  category: string;
  fromDate: string; // ISO 8601 format: 2026-01-18T08:07:34.119Z
  endDate: string;  // ISO 8601 format: 2026-01-20T08:07:34.119Z
  time?: string; // Time in HH:mm format
  location: string;
  privacy?: 'community' | 'internal';
}

export interface CreateCalendarPayload {
  communityId: number | string;
  events: CalendarEvent[];
}
