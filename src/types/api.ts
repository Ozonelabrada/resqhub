// Base API response structure
export interface BaseApiResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
}

// Statistics API response
export interface StatisticsResponse extends BaseApiResponse {
  data: StatisticsData;
}

export interface StatisticsData {
  id: number;
  statDate: string;
  totalItems: number;
  successfulMatches: number;
  activeReports: number;
  citiesCovered: number;
  newUsersToday: number;
  itemsReportedToday: number;
  matchesMadeToday: number;
  totalUsers: number;
  lostItemsCount: number;
  foundItemsCount: number;
  pendingReports: number;
  verifiedReports: number;
  averageMatchTimeHours: number;
  totalRewardAmount: number;
  mostActiveCity: string | null;
  calculatedAt: string;
  createdAt: string;
  successRate: number;
  averageMatchTimeFormatted: string;
  totalRewardFormatted: string;
}

export interface StatisticsResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: StatisticsData;
}

// Authentication types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password?: string; // Optional for OAuth2 users
  phone?: string;
  location?: string;
  bio?: string;
  agreeToNewsletter?: boolean;
  // OAuth2 specific fields
  provider?: 'google' | 'local';
  googleId?: string;
  profilePicture?: string;
}

export interface AuthResponse extends BaseApiResponse {
  data?: {
    user: UserData;
    token: string;
    refreshToken?: string;
  };
  // Alternative structure for backward compatibility
  user?: UserData;
  token?: string;
}

export interface OAuth2CallbackResponse extends BaseApiResponse {
  data?: {
    user: UserData;
    token: string;
  };
  user?: UserData;
  token?: string;
  requiresRegistration?: boolean; // If user needs to complete registration
  isNewUser?: boolean;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  provider?: 'google' | 'local';
  googleId?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// OAuth2 specific types
export interface OAuth2CallbackResponse extends BaseApiResponse {
  user?: UserData;
  token?: string;
  requiresRegistration?: boolean; // If user needs to complete registration
  isNewUser?: boolean;
}

// Items/Reports types
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

// Generic paginated response
export interface PaginatedResponse<T> extends BaseApiResponse {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
// ReportType as a union type and object
export type ReportType = 1 | 2;
export const ReportType = {
  Lost: 1 as ReportType,
  Found: 2 as ReportType
};

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

// Trending Reports types
export interface TrendingReportItem {
  title: string;
  organizationId: number;
  category: string;
  reports: number;
  trend: string;
  weeklyData: number[];
  labels: string[];
  categoryId: number;
}

// Updated to match actual API response structure
export interface TrendingReportsResponse extends BaseApiResponse {
  data: {
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    succeeded: boolean;
    items?: TrendingReportItem[]; // The actual trending reports might be in 'items'
    results?: TrendingReportItem[]; // Or in 'results'
    data?: TrendingReportItem[]; // Or nested in another 'data' property
    trendingReports?: TrendingReportItem[]; // Or in 'trendingReports'
    [key: string]: any; // Allow for flexibility in property names
  };
  errors: any;
  baseEntity: any;
}
