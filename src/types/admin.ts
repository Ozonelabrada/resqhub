import { UserData } from './auth';
import { BaseApiResponse } from './api';

// Admin Dashboard Overview
export interface AdminOverview {
  totalCommunities: number;
  pendingCommunities: number;
  totalUsers: number;
  totalReports: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: 'community_created' | 'community_approved' | 'community_rejected' | 'report_created' | 'user_registered';
  description: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
  };
}

// Community Management
export interface CommunitySummary {
  id: number;
  name: string;
  status: string;
  isActive: boolean;
  subscriptionTier: string | null;
  createdAt: string;
  membersCount: number;
  // Legacy fields kept as optional for compatibility
  owner?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  postsCount?: number;
  reportsCount?: number;
  updatedAt?: string;
}

export interface CommunityFeature {
  code: string;
  name: string;
  isActive: boolean;
}

export interface CommunityDetail extends CommunitySummary {
  description: string;
  bannerUrl?: string;
  location?: string;
  rules?: string[];
  parentId?: string | number | null;
  parentCommunityName?: string | null;
  childCommunities?: Array<{
    id: number;
    name: string;
    description: string;
    imageUrl?: string | null;
    isActive: boolean;
    memberCount: number;
    dateCreated: string;
    privacy: string;
  }>;
  moderators: UserData[];
  features?: CommunityFeature[];
  settings: {
    visibility: 'public' | 'private' | 'restricted';
    joinPolicy: 'open' | 'approval_required' | 'invite_only';
    moderationPolicy: 'strict' | 'normal' | 'relaxed';
  };
  statistics: {
    totalPosts: number;
    totalMembers: number;
    totalReports: number;
    avgPostsPerDay: number;
    engagementRate: number;
  };
}

export interface CommunityListParams {
  query?: string;
  status?: 'all' | 'pending' | 'active' | 'disabled' | 'rejected';
  subscriptionTier?: string;
  page?: number;
  pageSize?: number;
  sort?: 'name' | 'created_at' | 'members_count' | 'posts_count';
  order?: 'asc' | 'desc';
}

export interface CommunityListResponse extends BaseApiResponse {
  data: {
    items: CommunitySummary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  };
}

// Subscription Management
export interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startedAt: string;
  expiresAt: string;
  subscribersCount: number;
  monthlyRevenue: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  currency: string;
  payer: {
    id: string;
    name: string;
    email: string;
  };
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  description: string;
}

export interface SubscriptionListParams {
  communityId?: string | number;
  status?: 'all' | 'active' | 'expired' | 'cancelled';
  page?: number;
  pageSize?: number;
}

// Report Management  
export interface AdminReport {
  id: string | number;
  type: 'lost' | 'found' | 'abuse' | 'spam' | 'other';
  title: string;
  description: string;
  communityId?: string | number;
  communityName?: string;
  targetId?: string; // ID of the thing being reported
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  details: {
    category: string;
    location?: string;
    contactInfo?: string;
    images?: string[];
  };
}

export interface ReportSummary {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number; // in hours
  reportsByType: {
    lost: number;
    found: number;
    abuse: number;
    spam: number;
    other: number;
  };
  reportsByStatus: {
    pending: number;
    investigating: number;
    resolved: number;
    dismissed: number;
  };
  topCommunities: {
    id: string;
    name: string;
    reportCount: number;
  }[];
  topReporters: {
    id: string;
    name: string;
    reportCount: number;
  }[];
}

export interface ReportListParams {
  type?: 'all' | 'lost' | 'found' | 'abuse' | 'spam' | 'other';
  communityId?: string;
  status?: 'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  from?: string; // ISO date string
  to?: string; // ISO date string
  page?: number;
  pageSize?: number;
  sort?: 'created_at' | 'updated_at' | 'priority' | 'status';
  order?: 'asc' | 'desc';
}

export interface ReportListResponse extends BaseApiResponse {
  data: {
    items: AdminReport[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary: ReportSummary;
  };
}

// Admin Actions
export interface AdminAction {
  type: 'approve' | 'reject' | 'disable' | 'enable' | 'resolve' | 'escalate' | 'assign' | 'suspend' | 'terminate' | 'reactivate';
  reason?: string;
  assignedTo?: string;
  notifyUser?: boolean;
}

export interface AdminActionResponse extends BaseApiResponse {
  data: {
    success: boolean;
    message: string;
    updatedItem?: CommunitySummary | AdminReport;
  };
}

// Audit Trail
export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resourceType: 'community' | 'report' | 'user' | 'subscription';
  resourceId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Statistics and Analytics
export interface AdminStatistics {
  timeRange: string;
  trends: {
    userGrowth: Array<{ date: string; count: number }>;
    incidentVolume: Array<{ date: string; count: number }>;
  };
  distributions: {
    alertCategories: Record<string, number>;
    communityStatus: Record<string, number>;
  };
  kpis: {
    avgResponseTimeMinutes: number;
    resolutionRatePercentage: number;
  };
}

// Filters and Search
export interface AdminSearchFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string[];
  type?: string[];
  priority?: string[];
  assignedTo?: string[];
}

export interface AdminSearchParams {
  query?: string;
  filters?: AdminSearchFilters;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Export commonly used types
export type AdminDashboardTab = 'overview' | 'communities' | 'reports' | 'subscriptions' | 'audit';
export type CommunityStatus = CommunitySummary['status'];
export type AdminReportStatus = AdminReport['status'];
export type AdminReportType = AdminReport['type'];
export type AdminReportPriority = AdminReport['priority'];