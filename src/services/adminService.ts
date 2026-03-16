import api from '../api/client';
import { ENDPOINTS } from '../api/endpoint';
import type {
  AdminOverview,
  AdminActivity,
  CommunitySummary,
  CommunityDetail,
  CommunityListParams,
  CommunityListResponse,
  AdminReport,
  ReportListParams,
  ReportListResponse,
  ReportSummary,
  Subscription,
  Payment,
  SubscriptionListParams,
  AdminAction,
  AdminActionResponse,
  AuditLogEntry,
  AdminStatistics,
  AdminSearchParams,
  Application,
  ApplicationRole,
  ApplicationListParams,
  ApplicationListResponse,
  RiderApplication,
  SellerApplication,
  ServiceProviderApplication,
  RiderStatisticsOverview,
  RiderMetrics,
  RiderPerformance,
  PaginatedRiderPerformanceResponse,
  PaginatedStringResponse,
  RiderTrendPoint,
  RiderListResponse,
  AdminUser,
  UserListParams,
  UserListResponse,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest
} from '../types/admin';

export class AdminService {
  // Dashboard and Overview
  static async getOverview(): Promise<AdminOverview> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.OVERVIEW);
      // Handle both { data: { ...OverviewData } } and { ...OverviewData }
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      throw error;
    }
  }

  static async getStatistics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AdminStatistics> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.STATISTICS}?timeRange=${timeRange}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      throw error;
    }
  }

  // Community Management
  static async getCommunities(params: CommunityListParams = {}): Promise<CommunityListResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Normalize status to lowercase for API consistency
          const paramValue = key === 'status' && value ? value.toString().toLowerCase().trim() : value;
          queryParams.append(key, String(paramValue));
        }
      });

      const endpoint = params.status?.toString().toLowerCase().trim() === 'pending' ? ENDPOINTS.ADMIN.COMMUNITIES_PENDING : ENDPOINTS.ADMIN.COMMUNITIES;
      const response = await api.get(`${endpoint}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  static async getCommunityDetail(id: string | number): Promise<CommunityDetail> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community detail:', error);
      throw error;
    }
  }

  static async getCommunitySubscriptions(id: string | number): Promise<{ items: Subscription[] }> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}/subscriptions`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community subscriptions:', error);
      throw error;
    }
  }

  static async getCommunityPayments(id: string | number): Promise<{ items: Payment[] }> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}/payments`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community payments:', error);
      throw error;
    }
  }

  static async approveCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_APPROVE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error approving community:', error);
      throw error;
    }
  }

  static async rejectCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_REJECT(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error denying community:', error);
      throw error;
    }
  }

  static async suspendCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_SUSPEND(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error suspending community:', error);
      throw error;
    }
  }

  static async terminateCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_TERMINATE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error terminating community:', error);
      throw error;
    }
  }

  static async reactivateCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_REACTIVATE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error reactivating community:', error);
      throw error;
    }
  }

  static async updateCommunity(id: string | number, data: Partial<CommunityDetail>): Promise<AdminActionResponse> {
    try {
      const response = await api.put(ENDPOINTS.ADMIN.COMMUNITIES_UPDATE(String(id)), data);
      return response.data;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  }

  static async getReports(params: ReportListParams = {}): Promise<ReportListResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Map key to ReportStatus if it's the status filter
          const apiKey = key === 'status' ? 'ReportStatus' : key;
          queryParams.append(apiKey, String(value));
        }
      });

      const response = await api.get(`${ENDPOINTS.ADMIN.REPORTS}?${queryParams.toString()}`);
      
      // Resilient parsing for report list
      const responseData = response.data;
      if (responseData && responseData.succeeded) {
        return responseData;
      }
      
      // If we got a direct data object instead of the wrapper
      if (responseData && (responseData.items || Array.isArray(responseData))) {
        return {
          succeeded: true,
          message: 'Reports fetched successfully',
          statusCode: 200,
          data: {
            items: Array.isArray(responseData) ? responseData : responseData.items,
            total: responseData.total || (Array.isArray(responseData) ? responseData.length : 0),
            page: responseData.page || 1,
            pageSize: responseData.pageSize || 10,
            totalPages: responseData.totalPages || 1,
            summary: responseData.summary || {
              totalReports: 0,
              pendingReports: 0,
              resolvedReports: 0,
              averageResolutionTime: 0,
              reportsByType: {},
              reportsByStatus: {},
              topCommunities: [],
              topReporters: []
            }
          }
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  static async getReportDetail(id: string): Promise<AdminReport> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.REPORTS}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching report detail:', error);
      throw error;
    }
  }

  static async takeReportAction(id: string, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.post(ENDPOINTS.ADMIN.REPORT_ACTION(id), action);
      return response.data;
    } catch (error) {
      console.error('Error taking action on report:', error);
      throw error;
    }
  }

  // Subscription Management
  static async getSubscriptions(params: SubscriptionListParams = {}): Promise<Subscription[]> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.SUBSCRIPTIONS}?${new URLSearchParams(params as any).toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async getPayments(page: number = 1, pageSize: number = 20): Promise<{ items: Payment[], total: number }> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.PAYMENTS}?page=${page}&pageSize=${pageSize}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Audit and Logging
  static async getAuditLog(params: AdminSearchParams = {}): Promise<{ items: AuditLogEntry[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await api.get(`${ENDPOINTS.ADMIN.AUDIT}?${queryParams.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  static async logAdminAction(action: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await api.post(ENDPOINTS.ADMIN.AUDIT_LOG, action);
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Application Management
  static async getApplications(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    try {
      // build params object rather than manual string in case backend supports it
      const query: Record<string, string | number> = {};
      if (params.page) query.page = params.page;
      if (params.pageSize) query.pageSize = params.pageSize;
      if (params.applicationType && params.applicationType !== 'all') {
        query.applicationType = params.applicationType;
      }
      if (params.type) {
        // explicit type filter takes precedence
        query.type = params.type;
      }
      if (params.status && params.status !== 'all') {
        // backend uses 'submitted' rather than 'pending'
        query.status = params.status === 'pending' ? 'submitted' : params.status;
      }
      if (params.query) query.query = params.query;
      if (params.communityId) query.communityId = params.communityId;
      if (params.sort) query.sort = params.sort;
      if (params.order) query.order = params.order;

      const response = await api.get(ENDPOINTS.ADMIN.APPLICATIONS, { params: query });
      const body = response.data;

      // backend data shape may differ
      const resp = body.data || {};
      const totalCount = resp.totalCount ?? resp.total ?? 0;
      const page = resp.page ?? params.page ?? 1;
      const pageSize = resp.pageSize ?? params.pageSize ?? 10;
      const apps: Application[] = resp.applications || resp.items || [];
      const summary = {
        pending: resp.submittedCount ?? 0,
        approved: resp.approvedCount ?? 0,
        rejected: resp.rejectedCount ?? 0,
        suspended: resp.suspendedCount ?? 0,
      };

      return {
        succeeded: body.succeeded,
        message: body.message,
        statusCode: body.statusCode,
        data: {
          items: apps,
          total: totalCount,
          page,
          pageSize,
          totalPages: resp.totalPages ?? Math.ceil(totalCount / pageSize),
          summary
        }
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  static async getApplicationDetail(id: string): Promise<Application> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.APPLICATION_DETAIL(id));
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching application detail:', error);
      throw error;
    }
  }

  static async approveApplication(
    id: string,
    action: AdminAction,
    applicationType?: ApplicationRole
  ): Promise<AdminActionResponse> {
    try {
      const endpoint = applicationType === 'rider'
        ? ENDPOINTS.ADMIN.RIDER_APPLICATION_APPROVE(id)
        : ENDPOINTS.ADMIN.APPLICATION_APPROVE(id);
      const response = await api.patch(endpoint, action);
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  }

  static async rejectApplication(
    id: string,
    action: AdminAction,
    applicationType?: ApplicationRole
  ): Promise<AdminActionResponse> {
    try {
      const endpoint = applicationType === 'rider'
        ? ENDPOINTS.ADMIN.RIDER_APPLICATION_DENY(id)
        : ENDPOINTS.ADMIN.APPLICATION_REJECT(id);
      const response = await api.patch(endpoint, action);
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  }

  static async suspendApplication(
    id: string,
    action: AdminAction,
    applicationType?: ApplicationRole
  ): Promise<AdminActionResponse> {
    try {
      const endpoint = applicationType === 'rider'
        ? ENDPOINTS.ADMIN.RIDER_APPLICATION_SUSPEND(id)
        : ENDPOINTS.ADMIN.APPLICATION_SUSPEND(id);
      const response = await api.patch(endpoint, action);
      return response.data;
    } catch (error) {
      console.error('Error suspending application:', error);
      throw error;
    }
  }

  static async reactivateApplication(id: string, action: AdminAction): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.APPLICATION_REACTIVATE(id), action);
      return response.data;
    } catch (error) {
      console.error('Error reactivating application:', error);
      throw error;
    }
  }

  // Rider Statistics
  /**
   * Retrieve basic metrics such as activeToday, onBooking, completedRides, etc.
   */
  static async getRiderOverview(): Promise<RiderMetrics> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_STATISTICS);
      // backend response shape:
      // { message, succeeded, statusCode, data: { metrics: { ... } } }
      const payload = response.data.data;
      // payload may already be metrics object if server returns unwrapped
      const metrics: RiderMetrics = payload?.metrics ?? payload;
      return metrics;
    } catch (error) {
      console.error('Error fetching rider overview:', error);
      throw error;
    }
  }

  /**
   * Fetch paginated list of top performers. Caller may override paging/sort.
   */
  static async getRiderTopPerformers(
    page: number = 1,
    pageSize: number = 5,
    sortBy: string = 'rating',
    sortDescending: boolean = true
  ): Promise<{
    performers: RiderPerformance[];
    pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
  }> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_TOP_PERFORMERS, {
        params: { page, pageSize, sortBy, sortDescending },
      });
      const payload: PaginatedRiderPerformanceResponse = response.data.data;
      // map backend fields to our internal shape
      const performers = payload.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        profileImage: p.avatarUrl,
        rating: p.rating,
        reviewsCount: p.reviewsCount || 0,
        completedRides: p.completedRides,
        totalEarnings: p.earnings,
        acceptanceRate: p.acceptanceRate,
        joinedDate: p.joinedDate || '',
        status: p.status,
      } as RiderPerformance));
      return { performers, pagination: payload.pagination };
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }

  /**
   * Retrieve activity feed (array of messages).
   */
  static async getRiderActivityFeed(
    page: number = 1,
    pageSize: number = 20,
    fromDate?: string,
    toDate?: string,
    searchQuery?: string
  ): Promise<{
    activities: (string | any)[];
    pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
  }> {
    try {
      const params: any = { page, pageSize };
      // Send ISO 8601 UTC datetime strings to backend
      if (fromDate) {
        // Ensure ISO format with Z suffix for UTC
        params.fromDate = fromDate.endsWith('Z') ? fromDate : new Date(fromDate).toISOString();
      }
      if (toDate) {
        // Ensure ISO format with Z suffix for UTC
        params.toDate = toDate.endsWith('Z') ? toDate : new Date(toDate).toISOString();
      }
      if (searchQuery) params.search = searchQuery;

      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_ACTIVITY_FEED, {
        params,
      });
      const payload: any = response.data.data;
      return { activities: payload.data, pagination: payload.pagination };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  /**
   * Retrieve trend data between two dates; metric parameter is forwarded.
   */
  static async getRiderTrendData(
    fromDate: string,
    toDate: string,
    metric: string = 'all'
  ): Promise<RiderTrendPoint[]> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_TREND_DATA, {
        params: { fromDate, toDate, metric },
      });
      const payload: RiderTrendPoint[] = response.data.data;
      return payload;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }

  /**
   * Fetch paginated list of riders (public endpoint).
   */
  static async getRiderList(
    page: number = 1,
    pageSize: number = 10
  ): Promise<RiderListResponse> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_LIST, {
        params: { page, pageSize },
      });
      const payload: { data: RiderListResponse } = response.data;
      return payload.data;
    } catch (error) {
      console.error('Error fetching rider list:', error);
      throw error;
    }
  }

  /**
   * Aggregate all pieces into a single overview object.
   * timeRange is one of '7d'|'30d'|'90d'|'1y'; it is used to request trend data.
   */
  static async getRiderStatistics(
    timeRange: '7d' | '30d' | '90d' | '1y' = '7d'
  ): Promise<RiderStatisticsOverview> {
    try {
      const [metrics, top, activity, trend] = await Promise.all([
        this.getRiderOverview(),
        this.getRiderTopPerformers(1, 5),
        this.getRiderActivityFeed(1, 20),
        this.getRiderTrendData(
          (() => {
            const today = new Date();
            const start = new Date();
            switch (timeRange) {
              case '7d':
                start.setDate(today.getDate() - 6);
                break;
              case '30d':
                start.setDate(today.getDate() - 29);
                break;
              case '90d':
                start.setDate(today.getDate() - 89);
                break;
              case '1y':
                start.setFullYear(today.getFullYear() - 1);
                break;
            }
            return start.toISOString().split('T')[0];
          })(),
          new Date().toISOString().split('T')[0]
        ),
      ]);

      // guard against missing metrics object
      const baseMetrics: RiderMetrics = metrics || {} as RiderMetrics;
      // compute completion rate if missing
      const enrichedMetrics: RiderMetrics = {
        ...baseMetrics,
        rideCompletionRate:
          baseMetrics.rideCompletionRate !== undefined
            ? baseMetrics.rideCompletionRate
            : baseMetrics.cancellationRate !== undefined
            ? 100 - baseMetrics.cancellationRate
            : undefined,
      };

      return {
        metrics: enrichedMetrics,
        topPerformers: top.performers,
        topPerformersPagination: top.pagination,
        recentActivity: activity.activities,
        recentActivityPagination: activity.pagination,
        trendData: trend,
      };
    } catch (error) {
      console.error('Error fetching combined rider statistics:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed rider information including documents for admin review
   */
  static async getRiderDetail(id: string): Promise<any> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.RIDERS}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching rider detail:', error);
      throw error;
    }
  }

  // Document Management
  static async verifyDocument(documentId: string): Promise<any> {
    try {
      const response = await api.put(ENDPOINTS.ADMIN.DOCUMENT_VERIFY(documentId), {
        isVerified: true
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  // User Management
  static async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    try {
      const query: Record<string, string | number> = {};
      if (params.page) query.page = params.page;
      if (params.pageSize) query.pageSize = params.pageSize;
      if (params.role && params.role !== 'all') query.role = params.role;
      if (params.status && params.status !== 'all') query.status = params.status;
      if (params.query) query.query = params.query;
      if (params.sort) query.sort = params.sort;
      if (params.order) query.order = params.order;

      const response = await api.get(ENDPOINTS.ADMIN.USERS, { params: query });
      const body = response.data;

      const resp = body.data || {};
      const totalCount = resp.totalCount ?? resp.total ?? 0;
      const page = resp.page ?? params.page ?? 1;
      const pageSize = resp.pageSize ?? params.pageSize ?? 10;
      const users: AdminUser[] = (resp.users || resp.items || []).map((user: any) => AdminService.mapBackendUserToAdminUser(user));

      return {
        succeeded: body.succeeded,
        message: body.message,
        statusCode: body.statusCode,
        data: {
          items: users,
          total: totalCount,
          page,
          pageSize,
          totalPages: resp.totalPages ?? Math.ceil(totalCount / pageSize),
          summary: resp.summary || {
            total: totalCount,
            active: users.filter(u => u.isActive).length,
            inactive: users.filter(u => !u.isActive).length,
            admins: users.filter(u => u.role === 'Admin').length,
            moderators: users.filter(u => u.role === 'Moderator').length,
            users: users.filter(u => u.role === 'User').length
          }
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserDetail(userId: string): Promise<AdminUser> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.USER_DETAIL(userId));
      const backendUser = response.data.data || response.data;
      return AdminService.mapBackendUserToAdminUser(backendUser);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error;
    }
  }

  static async updateUserRole(request: UserRoleUpdateRequest): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.USER_UPDATE_ROLE(request.userId), {
        role: request.newRole,
        reason: request.reason
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        succeeded: false,
        message: 'Failed to update user role',
        statusCode: 500,
        data: {
          success: false,
          message: 'Failed to update user role'
        }
      };
    }
  }

  static async updateUserStatus(request: UserStatusUpdateRequest): Promise<AdminActionResponse> {
    try {
      const response = await api.patch(ENDPOINTS.ADMIN.USER_UPDATE_STATUS(request.userId), {
        status: request.status,
        reason: request.reason
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      return {
        succeeded: false,
        message: 'Failed to update user status',
        statusCode: 500,
        data: {
          success: false,
          message: 'Failed to update user status'
        }
      };
    }
  }

  static async deleteUser(userId: string, reason?: string): Promise<AdminActionResponse> {
    try {
      const response = await api.delete(ENDPOINTS.ADMIN.USER_DELETE(userId), {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        succeeded: false,
        message: 'Failed to delete user',
        statusCode: 500,
        data: {
          success: false,
          message: 'Failed to delete user'
        }
      };
    }
  }


  // User data mapping utilities
  private static mapBackendUserToAdminUser(backendUser: any): AdminUser {
    return {
      id: backendUser.userId,
      email: backendUser.email,
      username: backendUser.userName,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      fullName: backendUser.fullName,
      profilePicture: backendUser.profilePictureUrl,
      phoneNumber: backendUser.phoneNumber,
      role: AdminService.mapBackendRoleToFrontendRole(backendUser.role),
      emailVerified: backendUser.isEmailVerified,
      isActive: backendUser.status === 'Active',
      lastLoginAt: backendUser.lastLoginAt,
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.createdAt, // Backend doesn't provide updatedAt, using createdAt
    };
  }

  private static mapBackendRoleToFrontendRole(backendRole: string): AdminUser['role'] {
    const roleMap: Record<string, AdminUser['role']> = {
      'User': 'User',
      'Admin': 'Admin',
      'Moderator': 'Moderator',
      'admin': 'Admin', // Handle lowercase admin
      'moderator': 'Moderator', // Handle lowercase moderator
      'Rider': 'User', // Map rider to User
      'Seller': 'User', // Map seller to User
      'Service Provider': 'User', // Map service provider to User
    };
    return roleMap[backendRole] || 'User'; // Default to User
  }

  private static mapFrontendStatusToBackendStatus(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  /**
   * Fetch riders with credits and filters
   * GET /admin/riders?page=&pageSize=&searchQuery=&vehicle=&minRating=&maxRating=&isActive=
   */
  static async getRidersWithCredits(params: {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    vehicle?: string;
    minRating?: number;
    maxRating?: number;
    isActive?: boolean;
  }): Promise<any> {
    try {
      const query: Record<string, any> = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      };
      
      if (params.searchQuery) query.searchQuery = params.searchQuery;
      if (params.vehicle) query.vehicle = params.vehicle;
      if (params.minRating !== undefined) query.minRating = params.minRating;
      if (params.maxRating !== undefined) query.maxRating = params.maxRating;
      if (params.isActive !== undefined) query.isActive = params.isActive;

      const response = await api.get(ENDPOINTS.ADMIN.RIDERS, { params: query });
      return response.data;
    } catch (error) {
      console.error('Error fetching riders with credits:', error);
      throw error;
    }
  }

  // Rider Credits Management
  /**
   * Grant credits to a user
   * POST /api/services/admin/credits/grant
   */
  static async grantCreditsToUser(payload: {
    userId: string;
    serviceType: string;
    creditsToGrant: number;
    creditValue: number;
    reason: string;
  }): Promise<any> {
    try {
      const response = await api.post(ENDPOINTS.ADMIN.GRANT_CREDITS, payload);
      return response.data;
    } catch (error) {
      console.error('Error granting credits:', error);
      throw error;
    }
  }

  /**
   * Deduct credits from a user
   * POST /api/services/admin/credits/deduct
   */
  static async deductCreditsFromUser(payload: {
    userId: string;
    serviceType: string;
    creditsToDeduct: number;
    reason: string;
  }): Promise<any> {
    try {
      const response = await api.post(ENDPOINTS.ADMIN.DEDUCT_CREDITS, payload);
      return response.data;
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  /**
   * Get user's credit history with pagination
   * GET /api/services/admin/credits/history/{userId}?serviceType=&page=&pageSize=
   */
  static async getUserCreditHistory(
    userId: string,
    serviceType?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<any> {
    try {
      let endpoint = `${ENDPOINTS.ADMIN.CREDIT_HISTORY}/${userId}`;
      const params: any = { page, pageSize };
      
      if (serviceType) {
        params.serviceType = serviceType;
      }

      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching credit history:', error);
      throw error;
    }
  }

  /**
   * Get user's current available credits
   * GET /api/services/admin/users/{userId}/credits?serviceType=
   */
  static async getUserCurrentCredits(userId: string, serviceType?: string): Promise<any> {
    try {
      const endpoint = `${ENDPOINTS.ADMIN.USER_CREDITS}/${userId}/credits`;
      const params: any = {};
      
      if (serviceType) {
        params.serviceType = serviceType;
      }

      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user current credits:', error);
      throw error;
    }
  }

  /**
   * Get plan statistics
   * GET /api/services/admin/credits/statistics/{planId}
   */
  static async getPlanStatistics(planId: string): Promise<any> {
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.PLAN_STATISTICS}/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
      throw error;
    }
  }

  /**
   * Get pending credit purchases awaiting approval
   * GET /api/services/admin/credits/purchases/pending?page=&pageSize=
   */
  static async getPendingCreditPurchases(page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.PENDING_PURCHASES, {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending credit purchases:', error);
      throw error;
    }
  }

  /**
   * Get all credit purchase history with pagination
   * GET /api/services/admin/credits/history/all?serviceType=rider&page=&pageSize=
   */
  static async getAllCreditHistory(serviceType: string = 'rider', page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const response = await api.get(ENDPOINTS.ADMIN.CREDIT_HISTORY_ALL, {
        params: { serviceType, page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all credit history:', error);
      throw error;
    }
  }

  // Helper Methods for Mocking
}

export default AdminService;
