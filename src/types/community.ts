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
  isActive?: boolean;
  maxMembers?: number | null;
  isMember?: boolean;
  isAdmin?: boolean;
  isPrivate?: boolean;
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
  joinedAt: string;
  profilePicture?: string;
  isSeller?: boolean;
}

export interface JoinRequest {
  id: number;
  userId: string;
  userName: string;
  userFullName: string;
  profilePictureUrl?: string;
  communityId: number;
  dateCreated: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
