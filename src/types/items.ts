export type ReportType = 'Lost' | 'Found' | 'News' | 'Discussion' | 'Announcement' | string;

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
  reactionCount: number;
  commentsCount: number;
  dateCreated: string;
  lastModifiedDate: string;
}
