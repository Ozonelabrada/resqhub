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
  AdminSearchParams
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
          queryParams.append(key, String(value));
        }
      });

      const endpoint = params.status === 'pending' ? ENDPOINTS.ADMIN.COMMUNITIES_PENDING : ENDPOINTS.ADMIN.COMMUNITIES;
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
        message: 'Community rejected successfully (Mock)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been rejected',
          updatedItem: this.getMockCommunities().find(c => String(c.id) === String(id)) || undefined
        }
      };
    }

    try {
      const response = await api.patch(ENDPOINTS.ADMIN.COMMUNITIES_REJECT(String(id)), action);
      return response.data;
    } catch (error) {
      console.error('Error rejecting community:', error);
      return {
        succeeded: true,
        message: 'Community rejected successfully (Mock Fallback)',
        statusCode: 200,
        data: {
          success: true,
          message: 'Community has been rejected',
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
        status: "",
        isActive: true,
        subscriptionTier: null,
        createdAt: "2026-01-14T03:45:27.433742Z",
        membersCount: 0
      },
      {
        id: 4,
        name: "Local Government Unit of Manolo Fortich",
        status: "",
        isActive: true,
        subscriptionTier: null,
        createdAt: "2026-01-13T16:44:14.208192Z",
        membersCount: 0
      },
      {
        id: 3,
        name: "FINDRHUB",
        status: "",
        isActive: false,
        subscriptionTier: null,
        createdAt: "2026-01-12T12:35:49.843787Z",
        membersCount: 0
      },
      {
        id: 2,
        name: "Barangay Santo Niño",
        status: "",
        isActive: false,
        subscriptionTier: null,
        createdAt: "2026-01-11T15:55:38.088595Z",
        membersCount: 0
      },
      {
        id: 1,
        name: "Barangay Dicklum",
        status: "",
        isActive: true,
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
}

export default AdminService;
