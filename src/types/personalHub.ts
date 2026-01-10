// types/personalHub.ts
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  coverPhoto?: string;
  joinDate?: string;
  lastActive?: string;
}

export interface UserReport {
  id: string;
  title: string;
  category: string;
  location: string;
  currentLocation?: string;
  date: string;
  time?: string;
  status: string;
  views: number;
  type: 'lost' | 'found';
  isReacted?: boolean;
  reactionsCount: number;
  commentsCount: number;
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
  expiresAt?: string;
  reportTypeDescription?: string;
  verificationStatus?: string;
  potentialMatches: number;
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
  fullName: string;
  username: string;
  bio: string;
  location: string;
  profilePicture: string;
  coverPhoto: string;
}