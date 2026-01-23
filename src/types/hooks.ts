/**
 * Hook Return Type Definitions
 * 
 * Provides strongly-typed return values for custom hooks
 * to eliminate 'any' type usage in hooks layer
 */

import type {
  Report,
  UserProfile,
  Category,
  Community,
  CommunityMember,
  CommunityPost,
  UserReport
} from './index';
import type { NewsFeedItem } from '../types/personalHub';
import type { LostFoundItem } from '../services/reportsService';

// Placeholder types for missing definitions
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Statistics {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  totalCommunities: number;
}

/**
 * Generic return type for data-fetching hooks
 */
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

/**
 * Generic return type for paginated data hooks
 */
export interface UsePaginatedState<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * useNewsFeed Hook Return Type
 */
export interface UseNewsFeedReturn extends UsePaginatedState<NewsFeedItem> {
  fetchNewsFeed: (page?: number, isLoadMore?: boolean) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => void;
  setNewsFeedItems: (items: NewsFeedItem[]) => void;
}

/**
 * useUserReports Hook Return Type
 */
export interface UseUserReportsReturn extends UsePaginatedState<LostFoundItem> {
  fetchUserReports: (userId: string, page?: number) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => void;
  deleteReport: (reportId: string | number) => Promise<boolean>;
}

/**
 * useReportDetail Hook Return Type
 */
export interface UseReportDetailReturn extends UseAsyncState<Report> {
  fetch: (reportId: string | number) => Promise<void>;
  refetch: () => Promise<void>;
  updateReport: (updates: Partial<Report>) => Promise<void>;
}

/**
 * useUserProfile Hook Return Type
 */
export interface UseUserProfileReturn {
  userData: UserProfile | null;
  loading: boolean;
  error: Error | null;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

/**
 * useAuth Hook Return Type
 */
export interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (formData: Record<string, string>) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<boolean>;
}

/**
 * useCategories Hook Return Type
 */
export interface UseCategoriesReturn extends UseAsyncState<Category[]> {
  fetch: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useCommunities Hook Return Type
 */
export interface useCommunitiesReturn extends UsePaginatedState<Community> {
  fetch: (page?: number) => Promise<void>;
  fetchOne: (communityId: string) => Promise<Community | null>;
  searchCommunities: (query: string) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => void;
}

/**
 * useMessages Hook Return Type
 */
export interface UseMessagesReturn extends UsePaginatedState<Message> {
  fetchMessages: (conversationId?: string, page?: number) => Promise<void>;
  sendMessage: (content: string, recipientId?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMore: () => void;
}

/**
 * useNotifications Hook Return Type
 */
export interface UseNotificationsReturn extends UsePaginatedState<Notification> {
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  unreadCount: number;
}

/**
 * useStatistics Hook Return Type
 */
export interface UseStatisticsReturn extends UseAsyncState<Statistics> {
  fetch: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useTrendingReports Hook Return Type
 */
export interface UseTrendingReportsReturn extends UseAsyncState<NewsFeedItem[]> {
  fetchTrendingReports: () => Promise<void>;
  calculateAndRefresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useWatchList Hook Return Type
 */
export interface UseWatchListReturn extends UsePaginatedState<LostFoundItem> {
  addToWatchList: (reportId: string | number) => Promise<void>;
  removeFromWatchList: (reportId: string | number) => Promise<void>;
  isInWatchList: (reportId: string | number) => boolean;
  loadMore: () => void;
}

/**
 * useSignInForm Hook Return Type
 */
export interface UseSignInFormReturn {
  formData: { email: string; password: string };
  errors: Record<string, string>;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * useReportSubmission Hook Return Type
 */
export interface UseReportSubmissionReturn {
  formData: Record<string, string | number | boolean>;
  loading: boolean;
  error: string | null;
  updateFormData: (field: string, value: unknown) => void;
  submitReport: (reportData: Partial<LostFoundItem>) => Promise<boolean>;
  resetForm: () => void;
}

/**
 * useItems Hook Return Type
 */
export interface UseItemsReturn extends UsePaginatedState<LostFoundItem> {
  searchItems: (params: Record<string, string | number>) => Promise<void>;
  getItemDetail: (itemId: string | number) => Promise<LostFoundItem | null>;
  createItem: (itemData: Partial<LostFoundItem>) => Promise<LostFoundItem | null>;
  updateItem: (itemId: string | number, updates: Partial<LostFoundItem>) => Promise<LostFoundItem | null>;
  deleteItem: (itemId: string | number) => Promise<boolean>;
}

/**
 * Type Guards for Hook Returns
 */
export const isUseAsyncState = <T,>(data: unknown): data is UseAsyncState<T> => {
  const obj = data as Record<string, unknown>;
  return 'data' in obj && 'loading' in obj && 'error' in obj && 'isSuccess' in obj;
};

export const isUsePaginatedState = <T,>(data: unknown): data is UsePaginatedState<T> => {
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj?.items) &&
    typeof obj?.page === 'number' &&
    typeof obj?.pageSize === 'number' &&
    typeof obj?.hasMore === 'boolean'
  );
};
