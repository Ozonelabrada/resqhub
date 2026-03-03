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
  type: 'community_created' | 'community_approved' | 'community_denied' | 'report_created' | 'user_registered';
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
  status: string; // 'active' | 'pending' | 'denied' | 'disabled' | etc.
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
    status: string; // 'active' | 'pending' | 'denied' | 'disabled' | etc.
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
  status?: 'all' | 'pending' | 'active' | 'approved' | 'disabled' | 'denied';
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

// =========================================
// Application Management Types
// =========================================
export type ApplicationRole = 'rider' | 'seller' | 'service_provider';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ApplicationApplicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  communityId: string | number;
  communityName: string;
}

// Base application interface
export interface BaseApplication {
  id: string;
  applicantId: string;
  applicant: ApplicationApplicant;
  role: ApplicationRole;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
}

// Rider Application
export interface RiderApplication extends BaseApplication {
  role: 'rider';
  documents: {
    licenseNumber: string;
    licenseExpiry: string;
    vehicleType: string;
    plateNumber: string;
    insuranceCertificate?: string;
  };
  experience: {
    years: number;
    previousCompanies?: string;
  };
  rating?: number;
  completedRides?: number;
}

// Seller Application
export interface SellerApplication extends BaseApplication {
  role: 'seller';
  businessInfo: {
    businessName: string;
    businessType: string; // RETAIL, FOOD, SERVICES, EVENTS
    description: string;
    registrationNumber?: string;
    taxId?: string;
  };
  documents: {
    businessLicense?: string;
    taxCertificate?: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
  };
  productCategories?: string[];
  estimatedMonthlyRevenue?: number;
}

// Service Provider Application
export interface ServiceProviderApplication extends BaseApplication {
  role: 'service_provider';
  serviceInfo: {
    serviceName: string;
    category: string; // e.g., "Hair & Beauty", "Cleaning", "Home Repair"
    description: string;
    experience: number; // in years
    certifications?: string[];
  };
  documents: {
    certifications?: string[];
    backgroundCheck?: string;
    insuranceCertificate?: string;
  };
  serviceAreas?: string[];
  rating?: number;
  completedServices?: number;
}

// Union type for all applications
export type Application = RiderApplication | SellerApplication | ServiceProviderApplication;

export interface ApplicationListParams {
  communityId?: string | number;
  role?: ApplicationRole | 'all';
  /**
   * Optional raw type parameter for the backend (`rider` | `seller` | `service_provider`)
   * the hook/page can use this instead of or alongside `role`.
   */
  type?: string;
  status?: ApplicationStatus | 'all';
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: 'created_at' | 'updated_at' | 'status';
  order?: 'asc' | 'desc';
}

export interface ApplicationListResponse extends BaseApiResponse {
  data: {
    items: Application[];
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
    summary?: {
      pending: number;
      approved: number;
      rejected: number;
      suspended: number;
    };
  };
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

// =========================================
// Rider Statistics Types
// =========================================
export interface RiderMetrics {
  activeToday: number;
  onBooking: number;
  averageRating: number;
  totalEarnings: number;
  completedRides: number;
  acceptanceRate: number;
  cancellationRate: number;
  partnerRiders: number;
  totalReviews: number;
  /** computed by client when backend does not supply it */
  rideCompletionRate?: number;
}

export interface RiderPerformance {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  rating: number;
  reviewsCount?: number;
  completedRides: number;
  totalEarnings?: number;
  /** backend uses "earnings" field which we map */
  acceptanceRate: number;
  joinedDate?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface RiderTrendPoint {
  date: string;
  completedRides: number;
  revenue: number;
  activeRiders: number;
}

// Response for new rider list endpoint
export interface RiderListItem {
  id: number | string;
  userId: string;
  location: string;
  vehicle: string;
  plate: string;
  rating: number;
  reviews: number;
  isActive: boolean;
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  occupied: boolean;
  avatar?: string;
  totalCompletedRides: number;
  cancelledRides: number;
  dateCreated: string;
  userDetails: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    userName: string;
    profilePictureUrl?: string | null;
  };
}

export interface RiderListResponse {
  totalCount: number;
  allCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  suspendedCount: number;
  page: number;
  pageSize: number;
  riders: RiderListItem[];
}

export interface RiderStatisticsOverview {
  metrics: RiderMetrics;
  topPerformers: RiderPerformance[];
  recentActivity: string[]; // simple list of messages returned by backend
  trendData: RiderTrendPoint[];
}

// helper types for paginated endpoints
export interface PaginatedRiderPerformanceResponse {
  data: RiderPerformance[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface PaginatedStringResponse {
  data: string[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// User Management
export interface AdminUser {
  id: string;              // Maps from userId
  email: string;
  username?: string;       // Maps from userName
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string; // Maps from profilePictureUrl
  phoneNumber?: string;
  role: 'User' | 'Moderator' | 'Admin';
  emailVerified?: boolean; // Maps from isEmailVerified
  isActive: boolean;       // Maps from status === 'Active'
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Additional stats
  reportsCount?: number;
  communitiesCount?: number;
  bookingsCount?: number;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  role?: 'all' | 'User' | 'Moderator' | 'Admin';
  status?: 'all' | 'active' | 'inactive';
  query?: string;
  sort?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt';
  order?: 'asc' | 'desc';
}

export interface UserListResponse extends BaseApiResponse {
  data: {
    items: AdminUser[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary: {
      total: number;
      active: number;
      inactive: number;
      admins: number;
      users: number;
    };
  };
}

export interface UserRoleUpdateRequest {
  userId: string;
  newRole: AdminUser['role'];
  reason?: string;
}

export interface UserStatusUpdateRequest {
  userId: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Banned' | 'Pending';
  reason?: string;
}

// Export commonly used types
export type AdminDashboardTab = 'overview' | 'communities' | 'reports' | 'subscriptions' | 'audit';
export type CommunityStatus = CommunitySummary['status'];
export type AdminReportStatus = AdminReport['status'];
export type AdminReportType = AdminReport['type'];
export type AdminReportPriority = AdminReport['priority'];