export type ReportType = 'Lost' | 'Found' | 'News' | 'Discussion' | 'Announcement' | string;

export const ReportTypeEnum = {
  Lost: "Lost",
  Found: "Found",
  News: "News",
  Discussion: "Discussion",
  Announcement: "Announcement"
} as const;

export interface SearchParams {
  query?: string;
  category?: string;
  location?: string;
  type?: 'lost' | 'found';
  page?: number;
  limit?: number;
}

export interface CreateItemRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  type: 'lost' | 'found';
  images?: string[];
  contactInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
  reward?: string;
}

// Condition as a union type and object
export type Condition = 1 | 2 | 3 | 4;
export const Condition = {
  Excellent: 1 as Condition,
  Good: 2 as Condition,
  Fair: 3 as Condition,
  Damaged: 4 as Condition
};

// PreferredContactMethod as a union type and object
export type PreferredContactMethod = 1 | 2 | 3;
export const PreferredContactMethod = {
  Phone: 1 as PreferredContactMethod,
  Email: 2 as PreferredContactMethod,
  Both: 3 as PreferredContactMethod
};

// HandoverPreference as a union type and object
export type HandoverPreference = 1 | 2 | 3;
export const HandoverPreference = {
  Meet: 1 as HandoverPreference,
  Pickup: 2 as HandoverPreference,
  Mail: 3 as HandoverPreference
};

export interface ReportImage {
  id: number;
  imageUrl: string;
  description: string | null;
}

export interface ReportUser {
  id: string;
  fullName: string;
  username: string;
  profilePictureUrl?: string;
}

export interface Report {
  id: number;
  userId: string;
  reportType: ReportType;
  status: number;
  title: string;
  description: string;
  location: string;
  contactInfo: string;
  rewardDetails: string | null;
  categoryId: number | null;
  categoryName: string | null;
  verificationStatus: number;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  expiresAt: string | null;
  resolvedAt: string | null;
  images: ReportImage[];
  user: ReportUser;
  communityId?: number;
  communityName?: string | null;
  reactionsCount: number;
  commentsCount: number;
  dateCreated: string;
  lastModifiedDate: string;
  // Ownership verification - NEVER exposed in public API
  securityQuestionsCount?: number; // Only count, not content
  uniqueIdentifiersCount?: number; // Only count, not content
  hasOwnershipVerification?: boolean;
}
