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
  ApplicationListParams,
  ApplicationListResponse,
  RiderApplication,
  SellerApplication,
  ServiceProviderApplication,
  RiderStatisticsOverview,
  RiderMetrics
} from '../types/admin';

// Toggle this to use real API or local mock data
const USE_MOCK_DATA = false; 

export class AdminService {
  // Dashboard and Overview
  static async getOverview(): Promise<AdminOverview> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockOverview();
    }

    try {
      const response = await api.get(ENDPOINTS.ADMIN.OVERVIEW);
      // Handle both { data: { ...OverviewData } } and { ...OverviewData }
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      return this.getMockOverview();
    }
  }

  static async getStatistics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AdminStatistics> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockStatistics(timeRange);
    }

    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.STATISTICS}?timeRange=${timeRange}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      return this.getMockStatistics(timeRange);
    }
  }

  // Community Management
  static async getCommunities(params: CommunityListParams = {}): Promise<CommunityListResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const items = this.getMockCommunities();
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        succeeded: true,
        message: 'Communities fetched successfully (Mock)',
        statusCode: 200,
        data: {
          items: items.slice(start, end),
          total: items.length,
          page,
          pageSize,
          totalPages: Math.ceil(items.length / pageSize)
        }
      };
    }

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
      const items = this.getMockCommunities();
      return {
        succeeded: true,
        message: 'Communities fetched successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          items: items,
          total: items.length,
          page: 1,
          pageSize: items.length,
          totalPages: 1
        }
      };
    }
  }

  static async getCommunityDetail(id: string | number): Promise<CommunityDetail> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const mockCommunity = this.getMockCommunities().find(c => String(c.id) === String(id)) || this.getMockCommunities()[0];
      return this.enrichMockCommunityDetail(mockCommunity);
    }

    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community detail:', error);
      const mockCommunity = this.getMockCommunities().find(c => String(c.id) === String(id)) || this.getMockCommunities()[0];
      return this.enrichMockCommunityDetail(mockCommunity);
    }
  }

  static async getCommunitySubscriptions(id: string | number): Promise<{ items: Subscription[] }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        items: this.getMockSubscriptions()
      };
    }
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}/subscriptions`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community subscriptions:', error);
      return { items: this.getMockSubscriptions() };
    }
  }

  static async getCommunityPayments(id: string | number): Promise<{ items: Payment[] }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        items: this.getMockPayments()
      };
    }
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.COMMUNITIES}/${id}/payments`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching community payments:', error);
      return { items: this.getMockPayments() };
    }
  }

  static async approveCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      return {
        succeeded: true,
        message: 'Community approved successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been approved and is now active',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_APPROVE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error approving community:', error);
      return {
        succeeded: true,
        message: 'Community approved successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been approved and is now active',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }
  }

  static async rejectCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      return {
        succeeded: true,
        message: 'Community denied successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been denied',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_REJECT(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error denying community:', error);
      return {
        succeeded: true,
        message: 'Community denied successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been denied',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }
  }

  static async suspendCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Community suspended successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been suspended',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_SUSPEND(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error suspending community:', error);
      return {
        succeeded: true,
        message: 'Community suspended successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been suspended',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }
  }

  static async terminateCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Community terminated successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been terminated',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_TERMINATE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error terminating community:', error);
      return {
        succeeded: true,
        message: 'Community terminated successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been terminated',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }
  }

  static async reactivateCommunity(id: string | number, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Community reactivated successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been reactivated',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_REACTIVATE(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error reactivating community:', error);
      return {
        succeeded: true,
        message: 'Community reactivated successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been reactivated',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }
  }

  static async updateCommunity(id: string | number, data: Partial<CommunityDetail>): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Community updated successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community details have been updated',
          updatedItem: { ...this.getMockCommunities().find(c => String(c.id) === String(id)), ...data } as any
        }
      };
    }

    try {
      const response = await api.put(ENDPOINTS.ADMIN.COMMUNITIES_UPDATE(String(id)), data);
      return response.data;
    } catch (error) {
      console.error('Error updating community:', error);
      return {
        succeeded: false,
        message: 'Failed to update community details',
        statusCode: 500,
        data: {
          success: false,
          message: 'Failed to update community details'
        }
      };
    }
  }

  static async getReports(params: ReportListParams = {}): Promise<ReportListResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const items = this.getMockReports();
      return {
        succeeded: true,
        message: 'Reports fetched successfully (Mock)',
        statusCode: 200,
        data: {
          items: items.slice(0, params.pageSize || 10),
          total: items.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: Math.ceil(items.length / (params.pageSize || 10)),
          summary: this.getMockReportSummary()
        }
      };
    }

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
            summary: responseData.summary || this.getMockReportSummary()
          }
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching reports:', error);
      const items = this.getMockReports();
      return {
        succeeded: true,
        message: 'Reports fetched successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          items: items,
          total: items.length,
          page: 1,
          pageSize: items.length,
          totalPages: 1,
          summary: this.getMockReportSummary()
        }
      };
    }
  }

  static async getReportDetail(id: string): Promise<AdminReport> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockReports().find(r => r.id === id) || this.getMockReports()[0];
    }

    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.REPORTS}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching report detail:', error);
      return this.getMockReports().find(r => r.id === id) || this.getMockReports()[0];
    }
  }

  static async takeReportAction(id: string, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      return {
        succeeded: true,
        message: 'Action taken successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Action completed',
          updatedItem: this.getMockReports().find(r => r.id === id) || undefined
        }
      };
    }
    try {
      const response = await api.post(ENDPOINTS.ADMIN.REPORT_ACTION(id), action);
      return response.data;
    } catch (error) {
      console.error('Error taking action on report:', error);
      return {
        succeeded: false,
        message: 'Failed to take action',        statusCode: 500,
        data: { success: false, message: 'API error' }
      };
    }
  }

  // Subscription Management
  static async getSubscriptions(params: SubscriptionListParams = {}): Promise<Subscription[]> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockSubscriptions();
    }
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.SUBSCRIPTIONS}?${new URLSearchParams(params as any).toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return this.getMockSubscriptions();
    }
  }

  static async getPayments(page: number = 1, pageSize: number = 20): Promise<{ items: Payment[], total: number }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        items: this.getMockPayments(),
        total: this.getMockPayments().length
      };
    }
    try {
      const response = await api.get(`${ENDPOINTS.ADMIN.PAYMENTS}?page=${page}&pageSize=${pageSize}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      const payments = this.getMockPayments();
      return {
        items: payments,
        total: payments.length
      };
    }
  }

  // Audit and Logging
  static async getAuditLog(params: AdminSearchParams = {}): Promise<{ items: AuditLogEntry[]; total: number }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const items = this.getMockAuditLogs();
      return {
        items,
        total: items.length
      };
    }
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
      return {
        items: [],
        total: 0
      };
    }
  }

  static async logAdminAction(action: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Mock Audit Log:', action);
      return;
    }
    try {
      await api.post(ENDPOINTS.ADMIN.AUDIT_LOG, action);
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Application Management
  static async getApplications(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const items = this.getMockApplications();
      const filtered = this.filterMockApplications(items, params);
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        succeeded: true,
        message: 'Applications fetched successfully (Mock)',
        statusCode: 200,
        data: {
          items: filtered.slice(start, end),
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
          summary: this.getMockApplicationsSummary(filtered)
        }
      };
    }

    try {
      // build params object rather than manual string in case backend supports it
      const query: Record<string, string | number> = {};
      if (params.page) query.page = params.page;
      if (params.pageSize) query.pageSize = params.pageSize;
      if (params.role && params.role !== 'all') {
        query.role = params.role;
        // backend may expect applicationType instead of role
        query.applicationType = params.role;
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
      const items = this.getMockApplications();
      return {
        succeeded: true,
        message: 'Applications fetched successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          items: items.slice(0, params.pageSize || 10),
          total: items.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: Math.ceil(items.length / (params.pageSize || 10)),
          summary: this.getMockApplicationsSummary(items)
        }
      };
    }
  }

  static async getApplicationDetail(id: string): Promise<Application> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const app = this.getMockApplications().find(a => a.id === id);
      if (!app) throw new Error('Application not found');
      return app;
    }

    try {
      const response = await api.get(ENDPOINTS.ADMIN.APPLICATION_DETAIL(id));
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching application detail:', error);
      const app = this.getMockApplications().find(a => a.id === id);
      if (!app) throw error;
      return app;
    }
  }

  static async approveApplication(id: string, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Application approved successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been approved',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.APPLICATION_APPROVE(id), action);
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      return {
        succeeded: true,
        message: 'Application approved successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been approved',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }
  }

  static async rejectApplication(id: string, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Application rejected successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been rejected',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.APPLICATION_REJECT(id), action);
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      return {
        succeeded: true,
        message: 'Application rejected successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been rejected',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }
  }

  static async suspendApplication(id: string, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Application suspended successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been suspended',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.APPLICATION_SUSPEND(id), action);
      return response.data;
    } catch (error) {
      console.error('Error suspending application:', error);
      return {
        succeeded: true,
        message: 'Application suspended successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been suspended',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }
  }

  static async reactivateApplication(id: string, action: AdminAction): Promise<AdminActionResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return {
        succeeded: true,
        message: 'Application reactivated successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been reactivated',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.APPLICATION_REACTIVATE(id), action);
      return response.data;
    } catch (error) {
      console.error('Error reactivating application:', error);
      return {
        succeeded: true,
        message: 'Application reactivated successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Application has been reactivated',
          updatedItem: this.getMockApplications().find(a => a.id === id) as any
        }
      };
    }
  }

  // Rider Statistics
  /**
   * Retrieve basic metrics such as activeToday, onBooking, completedRides, etc.
   */
  static async getRiderOverview(): Promise<RiderMetrics> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockRiderStatistics().metrics;
    }

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
      return this.getMockRiderStatistics().metrics;
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
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const mock = this.getMockRiderStatistics();
      return {
        performers: mock.topPerformers,
        pagination: { page, pageSize, totalCount: mock.topPerformers.length, totalPages: 1 },
      };
    }

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
      const mock = this.getMockRiderStatistics();
      return {
        performers: mock.topPerformers,
        pagination: { page, pageSize, totalCount: mock.topPerformers.length, totalPages: 1 },
      };
    }
  }

  /**
   * Retrieve activity feed (array of messages).
   */
  static async getRiderActivityFeed(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    activities: string[];
    pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
  }> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const mock = this.getMockRiderStatistics();
      return {
        activities: mock.recentActivity.map(a => a.activity),
        pagination: { page, pageSize, totalCount: mock.recentActivity.length, totalPages: 1 },
      };
    }

    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_ACTIVITY_FEED, {
        params: { page, pageSize },
      });
      const payload: PaginatedStringResponse = response.data.data;
      return { activities: payload.data, pagination: payload.pagination };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      const mock = this.getMockRiderStatistics();
      return {
        activities: mock.recentActivity.map(a => a.activity),
        pagination: { page, pageSize, totalCount: mock.recentActivity.length, totalPages: 1 },
      };
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
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockRiderStatistics().trendData;
    }

    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_TREND_DATA, {
        params: { fromDate, toDate, metric },
      });
      const payload: RiderTrendPoint[] = response.data.data;
      return payload;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return this.getMockRiderStatistics().trendData;
    }
  }

  /**
   * Fetch paginated list of riders (public endpoint).
   */
  static async getRiderList(
    page: number = 1,
    pageSize: number = 10
  ): Promise<RiderListResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      const stats = this.getMockRiderStatistics();
      // convert mock stats to list format with fake riders
      return {
        totalCount: stats.topPerformers.length,
        allCount: stats.topPerformers.length,
        pendingCount: 0,
        approvedCount: stats.topPerformers.length,
        rejectedCount: 0,
        suspendedCount: 0,
        page,
        pageSize,
        riders: stats.topPerformers.map((p, idx) => ({
          id: idx + 1,
          userId: p.id,
          location: '',
          vehicle: '',
          plate: '',
          rating: p.rating,
          reviews: p.reviewsCount || 0,
          isActive: p.status === 'active',
          approvalStatus: p.status,
          occupied: false,
          avatar: p.profileImage,
          totalCompletedRides: p.completedRides,
          cancelledRides: 0,
          dateCreated: new Date().toISOString(),
          userDetails: {
            userId: p.id,
            firstName: p.name.split(' ')[0],
            lastName: p.name.split(' ')[1] || '',
            email: p.email || '',
            phoneNumber: '',
            userName: p.name,
            profilePictureUrl: p.profileImage || null,
          },
        })) as any,
      };
    }

    try {
      const response = await api.get(ENDPOINTS.ADMIN.RIDERS_LIST, {
        params: { page, pageSize },
      });
      const payload: { data: RiderListResponse } = response.data;
      return payload.data;
    } catch (error) {
      console.error('Error fetching rider list:', error);
      // fallback to empty
      return {
        totalCount: 0,
        allCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        suspendedCount: 0,
        page,
        pageSize,
        riders: [],
      };
    }
  }

  /**
   * Aggregate all pieces into a single overview object.
   * timeRange is one of '7d'|'30d'|'90d'|'1y'; it is used to request trend data.
   */
  static async getRiderStatistics(
    timeRange: '7d' | '30d' | '90d' | '1y' = '7d'
  ): Promise<RiderStatisticsOverview> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return this.getMockRiderStatistics();
    }

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
        recentActivity: activity.activities,
        trendData: trend,
      };
    } catch (error) {
      console.error('Error fetching combined rider statistics:', error);
      return this.getMockRiderStatistics();
    }
  }


  // Helper Methods for Mocking
  private static async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getMockOverview(): AdminOverview {
    return {
      totalCommunities: 45,
      pendingCommunities: 12,
      totalUsers: 1250,
      totalReports: 89,
      recentActivity: this.getMockRecentActivity()
    };
  }

  private static getMockStatistics(timeRange: string): AdminStatistics {
    return {
      timeRange: timeRange,
      trends: {
        userGrowth: [
          { date: '2026-01-11', count: 1200 },
          { date: '2026-01-12', count: 1250 }
        ],
        incidentVolume: [
          { date: '2026-01-11', count: 80 },
          { date: '2026-01-12', count: 89 }
        ]
      },
      distributions: {
        alertCategories: {
          medical: 45,
          fire: 12,
          security: 28,
          other: 4
        },
        communityStatus: {
          approved: 38,
          pending: 12,
          suspended: 2,
          active: 38
        }
      },
      kpis: {
        avgResponseTimeMinutes: 4.2,
        resolutionRatePercentage: 85.9
      }
    };
  }

  private static getMockReportSummary(): ReportSummary {
    return {
      totalReports: 156,
      pendingReports: 22,
      resolvedReports: 134,
      averageResolutionTime: 24.5,
      reportsByType: { lost: 89, found: 45, abuse: 12, spam: 8, other: 2 },
      reportsByStatus: { pending: 22, investigating: 15, resolved: 134, dismissed: 5 },
      topCommunities: [
        { id: 'c1', name: 'Bay Area', reportCount: 15 },
        { id: 'c2', name: 'Downtown', reportCount: 12 }
      ],
      topReporters: [
        { id: 'user1', name: 'John Doe', reportCount: 5 },
        { id: 'user2', name: 'Jane Smith', reportCount: 3 }
      ]
    };
  }

  private static enrichMockCommunityDetail(community: CommunitySummary): CommunityDetail {
    return {
      ...community,
      description: 'A vibrant community dedicated to helping members find their lost items and connect with their neighbors in ' + community.name,
      bannerUrl: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=1200&h=400&fit=crop',
      location: 'San Francisco, CA',
      rules: [
        'Be respectful to all community members',
        'Only post legitimate lost and found items',
        'Include clear descriptions and photos when possible',
        'Follow up when items are found or recovered'
      ],
      moderators: [
        {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      settings: {
        visibility: 'public',
        joinPolicy: 'approval_required',
        moderationPolicy: 'normal'
      },
      statistics: {
        totalPosts: community.postsCount || 245,
        totalMembers: community.membersCount || 1250,
        totalReports: community.reportsCount || 12,
        avgPostsPerDay: 8.2,
        engagementRate: 76.5
      }
    };
  }

  private static getMockCommunities(): CommunitySummary[] {
    return [
      {
        id: 5,
        name: "sdsds",
        status: "active",
        subscriptionTier: null,
        createdAt: "2026-01-14T03:45:27.433742Z",
        membersCount: 0
      },
      {
        id: 4,
        name: "Local Government Unit of Manolo Fortich",
        status: "active",
        subscriptionTier: null,
        createdAt: "2026-01-13T16:44:14.208192Z",
        membersCount: 0
      },
      {
        id: 3,
        name: "FINDRHUB",
        status: "inactive",
        subscriptionTier: null,
        createdAt: "2026-01-12T12:35:49.843787Z",
        membersCount: 0
      },
      {
        id: 2,
        name: "Barangay Santo Niño",
        status: "inactive",
        subscriptionTier: null,
        createdAt: "2026-01-11T15:55:38.088595Z",
        membersCount: 0
      },
      {
        id: 1,
        name: "Barangay Dicklum",
        status: "active",
        subscriptionTier: null,
        createdAt: "2026-01-11T15:37:22.028191Z",
        membersCount: 0
      }
    ];
  }

  private static getMockReports(): AdminReport[] {
    return [
      {
        id: 'report1',
        type: 'lost',
        title: 'Lost iPhone 15 Pro',
        description: 'Lost my iPhone near the university campus. It has a blue case.',
        communityId: '2',
        communityName: 'University District',
        targetId: 'item123',
        reporter: {
          id: 'user5',
          name: 'Alice Johnson',
          email: 'alice@example.com'
        },
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        details: {
          category: 'Electronics',
          location: 'University Campus, Building A',
          contactInfo: 'alice@example.com',
          images: ['https://images.unsplash.com/photo-1592910404753-0c42e1018d20?w=200&h=200&fit=crop']
        }
      },
      {
        id: 'report2',
        type: 'abuse',
        title: 'Inappropriate behavior in community chat',
        description: 'User posting spam messages repeatedly in the general channel.',
        communityId: '1',
        communityName: 'Downtown Community',
        targetId: 'user789',
        reporter: {
          id: 'user6',
          name: 'Charlie Brown',
          email: 'charlie@example.com'
        },
        status: 'investigating',
        priority: 'high',
        assignedTo: {
          id: 'admin1',
          name: 'Admin User'
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        details: {
          category: 'Community Guidelines',
          contactInfo: 'charlie@example.com'
        }
      }
    ];
  }

  private static getMockSubscriptions(): Subscription[] {
    return [
      {
        id: 'sub1',
        planName: 'Pro Plan',
        status: 'active',
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        subscribersCount: 245,
        monthlyRevenue: 2450
      },
      {
        id: 'sub2',
        planName: 'Premium Plan',
        status: 'active',
        startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
        subscribersCount: 89,
        monthlyRevenue: 1780
      }
    ];
  }

  private static getMockPayments(): Payment[] {
    return [
      {
        id: 'pay1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 29.99,
        currency: 'USD',
        payer: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        status: 'completed',
        invoiceUrl: 'https://example.com/invoice/pay1',
        description: 'Pro Plan - Monthly Subscription'
      }
    ];
  }

  private static getMockRecentActivity(): AdminActivity[] {
    return [
      {
        id: '1',
        type: 'community_created',
        description: 'New community "Bay Area Lost & Found" created',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: { id: 'user1', name: 'John Doe' }
      },
      {
        id: '2',
        type: 'report_created',
        description: 'Lost item report submitted in Downtown Community',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actor: { id: 'user2', name: 'Jane Smith' }
      },
      {
        id: '3',
        type: 'community_approved',
        description: 'Community "Tech Workers" approved',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actor: { id: 'admin1', name: 'Admin User' }
      }
    ];
  }

  private static getMockAuditLogs(): AuditLogEntry[] {
    return [
      {
        id: '1',
        adminId: 'admin1',
        adminName: 'Admin User',
        action: 'Approve Community',
        resourceType: 'community',
        resourceId: 'c1',
        details: 'Approved Bay Area Community',
        timestamp: new Date().toISOString()
      }
    ];
  }

  // Mock Applications Data
  private static getMockApplications(): Application[] {
    return [
      {
        id: 'app-rider-001',
        applicantId: 'user-001',
        applicant: {
          id: 'user-001',
          name: 'John Rodriguez',
          email: 'john.rodriguez@example.com',
          phone: '+1-555-0101',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          communityId: 1,
          communityName: 'Bay Area Community'
        },
        role: 'rider',
        status: 'pending',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        documents: {
          licenseNumber: 'DL-123456789',
          licenseExpiry: '2027-12-31',
          vehicleType: 'Sedan',
          plateNumber: 'ABC-1234'
        },
        experience: {
          years: 3,
          previousCompanies: 'Uber, Grab'
        }
      },
      {
        id: 'app-seller-001',
        applicantId: 'user-002',
        applicant: {
          id: 'user-002',
          name: 'Maria Santos',
          email: 'maria.santos@example.com',
          phone: '+1-555-0102',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          communityId: 2,
          communityName: 'Downtown Community'
        },
        role: 'seller',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        businessInfo: {
          businessName: 'Maria\'s Shop',
          businessType: 'RETAIL',
          description: 'We sell premium electronics and accessories',
          registrationNumber: 'REG-2024-001'
        },
        documents: {
          businessLicense: 'BL-123456',
          bankDetails: {
            bankName: 'Philippine Bank',
            accountNumber: '****1234',
            accountHolder: 'Maria Santos'
          }
        },
        productCategories: ['Electronics', 'Accessories'],
        estimatedMonthlyRevenue: 50000
      },
      {
        id: 'app-service-001',
        applicantId: 'user-003',
        applicant: {
          id: 'user-003',
          name: 'David Chen',
          email: 'david.chen@example.com',
          phone: '+1-555-0103',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          communityId: 3,
          communityName: 'Tech District'
        },
        role: 'service_provider',
        status: 'approved',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@example.com'
        },
        serviceInfo: {
          serviceName: 'Professional Home Repair',
          category: 'Home Repair',
          description: 'Specializing in plumbing, electrical, and carpentry work',
          experience: 8,
          certifications: ['Electrical License', 'Plumbing Certification']
        },
        documents: {
          certifications: ['EL-12345', 'PL-67890'],
          insuranceCertificate: 'INS-54321'
        },
        serviceAreas: ['Downtown', 'Midtown', 'Uptown'],
        rating: 4.8,
        completedServices: 45
      },
      {
        id: 'app-rider-002',
        applicantId: 'user-004',
        applicant: {
          id: 'user-004',
          name: 'Angela Torres',
          email: 'angela.torres@example.com',
          phone: '+1-555-0104',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Angela',
          communityId: 1,
          communityName: 'Bay Area Community'
        },
        role: 'rider',
        status: 'rejected',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: {
          id: 'admin-002',
          name: 'Manager Admin',
          email: 'manager@example.com'
        },
        documents: {
          licenseNumber: 'DL-987654321',
          licenseExpiry: '2025-06-15',
          vehicleType: 'Motorcycle',
          plateNumber: 'DEF-5678'
        },
        experience: {
          years: 1
        },
        rejectionReason: 'License expiration date does not meet requirements'
      },
      {
        id: 'app-seller-002',
        applicantId: 'user-005',
        applicant: {
          id: 'user-005',
          name: 'Robert Kim',
          email: 'robert.kim@example.com',
          phone: '+1-555-0105',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
          communityId: 4,
          communityName: 'Food District'
        },
        role: 'seller',
        status: 'suspended',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@example.com'
        },
        businessInfo: {
          businessName: 'Kim\'s Food Truck',
          businessType: 'FOOD',
          description: 'Korean street food and fusion dishes',
          registrationNumber: 'REG-2023-456'
        },
        documents: {
          businessLicense: 'BL-654321'
        },
        productCategories: ['Korean Food', 'Fusion']
      }
    ];
  }

  private static filterMockApplications(apps: Application[], params: ApplicationListParams): Application[] {
    let filtered = [...apps];

    if (params.role && params.role !== 'all') {
      filtered = filtered.filter(app => app.role === params.role);
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter(app => app.status === params.status);
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicant.name.toLowerCase().includes(query) ||
        app.applicant.email.toLowerCase().includes(query) ||
        app.applicant.communityName.toLowerCase().includes(query)
      );
    }

    if (params.sort === 'created_at') {
      filtered.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return params.order === 'desc' ? bDate - aDate : aDate - bDate;
      });
    } else if (params.sort === 'updated_at') {
      filtered.sort((a, b) => {
        const aDate = new Date(a.updatedAt).getTime();
        const bDate = new Date(b.updatedAt).getTime();
        return params.order === 'desc' ? bDate - aDate : aDate - bDate;
      });
    }

    return filtered;
  }

  private static getMockApplicationsSummary(apps: Application[]) {
    return {
      pending: apps.filter(a => a.status === 'pending').length,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
      suspended: apps.filter(a => a.status === 'suspended').length
    };
  }

  // Mock Rider Statistics
  private static getMockRiderStatistics(): RiderStatisticsOverview {
    return {
      metrics: {
        activeToday: 156,
        onBooking: 43,
        averageRating: 4.7,
        totalEarnings: 450230,
        completedRides: 8934,
        acceptanceRate: 94.5,
        cancellationRate: 2.8,
        partnerRiders: 230,
        totalReviews: 7321,
        rideCompletionRate: 97.2
      },
      topPerformers: [
        {
          id: 'rider-001',
          name: 'Maria Santos',
          email: 'maria.santos@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          rating: 4.9,
          reviewsCount: 1245,
          completedRides: 2150,
          totalEarnings: 65340,
          acceptanceRate: 98.5,
          joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'rider-002',
          name: 'Juan Dela Cruz',
          email: 'juan.delacruz@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
          rating: 4.8,
          reviewsCount: 892,
          completedRides: 1823,
          totalEarnings: 58920,
          acceptanceRate: 97.2,
          joinedDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'rider-003',
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          rating: 4.7,
          reviewsCount: 756,
          completedRides: 1654,
          totalEarnings: 52130,
          acceptanceRate: 96.8,
          joinedDate: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'rider-004',
          name: 'Sofia Rodriguez',
          email: 'sofia.rodriguez@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
          rating: 4.6,
          reviewsCount: 634,
          completedRides: 1432,
          totalEarnings: 48750,
          acceptanceRate: 95.3,
          joinedDate: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'rider-005',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          rating: 4.5,
          reviewsCount: 521,
          completedRides: 1165,
          totalEarnings: 41230,
          acceptanceRate: 93.7,
          joinedDate: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ],
      recentActivity: [
        'Completed ride to Downtown Mall',
        'Accepted new booking request',
        'Received 5-star review from customer',
        'Completed ride to Airport',
        'Started new ride'
      ],
      trendData: [
        { date: '2026-01-26', activeRiders: 145, completedRides: 634, revenue: 18920 },
        { date: '2026-01-27', activeRiders: 152, completedRides: 712, revenue: 21340 },
        { date: '2026-01-28', activeRiders: 148, completedRides: 689, revenue: 20560 },
        { date: '2026-01-29', activeRiders: 158, completedRides: 745, revenue: 22310 },
        { date: '2026-01-30', activeRiders: 161, completedRides: 823, revenue: 24670 },
        { date: '2026-01-31', activeRiders: 156, completedRides: 892, revenue: 26750 },
        { date: '2026-02-01', activeRiders: 156, completedRides: 856, revenue: 25630 }
      ]
    };
  }
}

export default AdminService;
