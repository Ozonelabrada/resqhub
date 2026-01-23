import api from '../api/client';

export interface LostFoundItem {
  id?: number;
  reportId?: number;
  userId?: string;
  reportType?: 'Lost' | 'Found' | number | string;
  status?: number;
  statusDescription?: string;
  title?: string;
  itemName?: string;
  description?: string;
  location?: string;
  incidentLocation?: string;
  currentLocation?: string;
  contactInfo?: string;
  rewardDetails?: string | null;
  specificLocation?: string;
  categoryId?: number | null;
  categoryName?: string | null;
  category?: string;
  itemCategory?: string;
  verificationStatus?: number;
  verificationStatusDescription?: string;
  isFeatured?: boolean;
  expiresAt?: string | null;
  resolvedAt?: string | null;
  images?: Array<{
    id?: number;
    imageUrl?: string;
    description?: string | null;
  }>;
  imageUrls?: string[];
  user?: {
    id?: string;
    fullName?: string;
    username?: string;
    profilePictureUrl?: string;
  };
  reactionsCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  views?: number;
  isReacted?: boolean;
  communityName?: string;
  isAbusive?: boolean;
  dateCreated?: string;
  lastModifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  incidentDate?: string;
  incidentTime?: string;
  circumstances?: string;
  identifyingFeatures?: string;
  condition?: string | number;
  handoverPreference?: string | number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  preferredContactMethod?: string | number;
  rewardAmount?: number;
  rewardDescription?: string;
  storageLocation?: string;
  dateModified?: string;
  reportTypeDescription?: string;
  potentialMatchesCount?: number;
  type?: 'lost' | 'found' | 'news' | 'discussion' | 'announcement';
}

export const ReportsService = {
  async getReportById(id: string | number): Promise<LostFoundItem | null> {
    try {
      const response = await api.get<{ data: LostFoundItem }>(`/reports/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching report detail:', error);
      return null;
    }
  },

  async markAsAbusive(id: string | number): Promise<void> {
    try {
      await api.put(`/reports/${id}/mark-abusive`, { isAbusive: true });
    } catch (error) {
      console.error('Error marking report as abusive:', error);
      throw error;
    }
  },

  async getReports(params?: { 
    reportType?: string; 
    page?: number; 
    pageSize?: number;
    search?: string;
    status?: number | string;
  }): Promise<LostFoundItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.reportType && params.reportType !== 'all') {
        // Capitalize for backend consistency (e.g., 'lost' -> 'Lost')
        const formattedType = params.reportType.charAt(0).toUpperCase() + params.reportType.slice(1).toLowerCase();
        query.append('ReportType', formattedType);
      }
      if (params?.page) query.append('pageNumber', String(params.page));
      if (params?.pageSize) query.append('pageSize', String(params.pageSize));
      if (params?.search) query.append('search', params.search);
      if (params?.status !== undefined) query.append('ReportStatus', String(params.status));
      
      const url = `/reports/all${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<any>(url);
      
      // Robust extraction to handle various backend response structures
      const rawData = response.data;
      let items: LostFoundItem[] = [];

      // Check for nested data property (standard for this API)
      if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
        items = rawData.data.data;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        items = rawData.data;
      } else if (Array.isArray(rawData)) {
        items = rawData;
      }

      return items;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async deleteReport(id: string | number): Promise<void> {
    try {
      await api.delete(`/reports/${id}`);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  /**
   * Creates a new report using multipart/form-data
   * Fields required by backend:
   * - UserId (uuid)
   * - CategoryId (int)
   * - Title (string)
   * - Description (string)
   * - Location (string)
   * - ContactInfo (string)
   * - RewardDetails (string)
   * - ReportType (string: "news" | "discussion" | "announcement" | "lost" | "found")
   * - ImageFiles[] (files)
   */
  async createReport(payload: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // The client interceptor handles removing Content-Type for FormData
      const response = await api.post('/reports', payload);
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error: any) {
      console.error('Error creating report:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to create report' 
      };
    }
  },

  async updateReport(id: string | number, payload: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.put(`/reports/${id}`, payload);
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error: any) {
      console.error('Error updating report:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to update report' 
      };
    }
  }
};
