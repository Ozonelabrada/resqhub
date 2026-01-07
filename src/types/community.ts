export interface Community {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo?: string;
  banner?: string;
  membersCount: number;
  location: string;
  rules: string[];
  foundedDate: string;
  isMember?: boolean;
  isAdmin?: boolean;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  type: 'general' | 'news' | 'announcement' | 'lost' | 'found';
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface CommunityMember {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  profilePicture?: string;
}
