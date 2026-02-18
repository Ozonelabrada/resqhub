// types/personalHub.ts
export interface UserProfile {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  email: string;
  bio?: string;
  location?: string | null;
  profilePicture?: string | null;
  coverPhoto?: string | null;
  profilePictureUrl?: string | null;
  coverPhotoUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  sex?: string | null;
  joinDate?: string;
  lastActive?: string;
}

export interface PossibleMatch {
  id: string;
  reportId: string;
  name?: string;
  username?: string;
  title?: string;
  description?: string;
  similarity?: number;
}

export interface NewsFeedItem extends UserReport {
  user: {
    id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  communityName?: string;
  timeAgo: string;
  status: 'lost' | 'found' | 'reunited' | 'news' | 'discussion' | 'announcement';
  isAbusive?: boolean;
  possibleMatches?: PossibleMatch[];
}

export interface UserReport {
  id?: string | number;
  title: string;
  category: string;
  location: string;
  currentLocation?: string;
  date?: string;
  time?: string;
  status: string;
  views: number;
  type: 'lost' | 'found' | 'news' | 'discussion' | 'announcement';
  isReacted?: boolean;
  reactionsCount?: number;
  commentsCount?: number;
  description: string;
  circumstances?: string;
  identifyingFeatures?: string;
  condition: string;
  handoverPreference: string;
  contactInfo: {
    name: string;
    phone?: string;
    email?: string;
    preferredContact: string;
  };
  reward: {
    amount: number;
    description?: string;
  };
  images: string[];
  storageLocation?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  reportTypeDescription?: string;
  verificationStatus?: string;
  potentialMatches: number;
  matchId?: number | null;
}

export interface WatchListItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  similarity: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: string;
}

export interface UserStats {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  totalViews: number;
}

export interface EditProfileForm {
  firstName?: string;
  lastName?: string;
  fullName: string;
  username: string;
  bio: string;
  location?: string | null;
  profilePicture?: string | null;
  profilePictureUrl?: string | null;
  coverPhoto?: string | null;
  coverPhotoUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null; // ISO date string
  sex?: string | null;
}