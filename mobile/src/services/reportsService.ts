/**
 * 📋 Reports Service
 * Handles all report-related API calls
 */

import { apiCall } from './api';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  userEmail: string;
  userName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'resolved' | 'closed';
  category?: string;
  reward?: string;
  views?: number;
  reactions?: Array<{ id: string; type: string; userId: string }>;
}

export interface ReportResponse {
  data: Report[] | Report;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const ReportsService = {
  /**
   * Get all reports with pagination and filtering
   */
  async getReports(filters?: {
    type?: 'lost' | 'found';
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return apiCall<ReportResponse>('get', '/reports', undefined, {
      params: filters,
    });
  },

  /**
   * Get single report by ID
   */
  async getReportById(id: string) {
    return apiCall<ReportResponse>('get', `/reports/${id}`);
  },

  /**
   * Create new report
   */
  async createReport(data: Partial<Report>) {
    return apiCall<ReportResponse>('post', '/reports', data);
  },

  /**
   * Update existing report
   */
  async updateReport(id: string, data: Partial<Report>) {
    return apiCall<ReportResponse>('put', `/reports/${id}`, data);
  },

  /**
   * Delete report
   */
  async deleteReport(id: string) {
    return apiCall('delete', `/reports/${id}`);
  },

  /**
   * Search reports
   */
  async searchReports(query: string, type?: 'lost' | 'found') {
    return apiCall<ReportResponse>('get', '/reports/search', undefined, {
      params: { q: query, type },
    });
  },

  /**
   * Get trending reports
   */
  async getTrendingReports() {
    return apiCall<ReportResponse>('get', '/reports/trending');
  },

  /**
   * Get user's reports
   */
  async getUserReports(userId: string) {
    return apiCall<ReportResponse>('get', `/users/${userId}/reports`);
  },

  /**
   * Add reaction (like, heart, etc.)
   */
  async addReaction(reportId: string, type: string) {
    return apiCall('post', `/reports/${reportId}/reactions`, { type });
  },

  /**
   * Remove reaction
   */
  async removeReaction(reportId: string, reactionId: string) {
    return apiCall('delete', `/reports/${reportId}/reactions/${reactionId}`);
  },

  /**
   * Get comments for report
   */
  async getComments(reportId: string) {
    return apiCall('get', `/reports/${reportId}/comments`);
  },

  /**
   * Add comment to report
   */
  async addComment(reportId: string, text: string) {
    return apiCall('post', `/reports/${reportId}/comments`, { text });
  },
};

export default ReportsService;
