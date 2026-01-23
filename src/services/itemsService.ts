import apiClient from '../api/client';
import type { LostFoundItem } from './reportsService';
import axios from 'axios';

interface ItemsSearchParams {
  pageNo: number;
  pageSize: number;
  [key: string]: string | number | boolean | undefined;
}

const getReportsSearch = (page: number, params: ItemsSearchParams = { pageNo: page, pageSize: 10 }): Promise<{ data: { data: LostFoundItem[] } }> => {
  // Always include page number and page size
  const query: ItemsSearchParams = { pageNo: page, pageSize: 10 };
  Object.keys(params).forEach(key => {
    if (key !== 'pageNo' && key !== 'pageSize') {
      query[key] = params[key];
    }
  });
  return axios.get('/api/reports/all', { params: query });
};

export const ItemsService = {
  // Main report creation
  createReport(reportData: Partial<LostFoundItem>): Promise<{ data: Report }> {
    return apiClient.post('/reports/create', reportData);
  },

  // Report item details creation
  createReportItemDetails(itemDetailsData: Record<string, unknown>): Promise<{ data: { id: string; reportId: string } }> {
    return apiClient.post('/report-item-details/create', itemDetailsData);
  },

  // Report contact info creation
  createReportContactInfo(contactInfoData: Record<string, unknown>): Promise<{ data: { id: string; reportId: string } }> {
    return apiClient.post('/report-contact-info/create', contactInfoData);
  },

  // Report location details creation
  createReportLocationDetails(locationDetailsData: Record<string, unknown>): Promise<{ data: { id: string; reportId: string } }> {
    return apiClient.post('/report-location-details/create', locationDetailsData);
  },

  // Get categories from backend
  getCategories(pageSize: number = 100, page: number = 1) {
    return apiClient.get(`/categories?pageSize=${pageSize}&page=${page}`);
  },

  // Get items for suggestions
  getItems(isActive: boolean = true, pageSize: number = 100, page: number = 1) {
    return apiClient.get(`/items?isActive=${isActive}&pageSize=${pageSize}&page=${page}`);
  },

  // Get report images
  getReportImages(reportId: number) {
    return apiClient.get(`/report-images/report/${reportId}`);
  },

  // Upload report image (assuming this endpoint exists)
  uploadReportImage(imageFile: File, reportId?: number) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (reportId) {
      formData.append('reportId', reportId.toString());
    }
    return apiClient.post('/images/upload', formData);
  },

  // Get reports by user
  getReportsByUser(userId: string, _nextPage: number) {
    return apiClient.get(`/reports/all?userId=${userId}`);
  },

  // Instance methods for backward compatibility
  getReports(userId: string, page: number, categories: string[]) {
    return apiClient.get(`/reports/all?userId=${userId}&page=${page}&categories=${categories.join(',')}`);
  },
  getReportsSearch: getReportsSearch,
  getWatchListByUser(userId: string) {
    return apiClient.get(`/reports/all/${userId}`);
  },

  searchItems(params: ItemsSearchParams) {
    return apiClient.post('/items/search', params);
  },

  createItem(payload: any) {
    return apiClient.post('/items', payload);
  },
  createItemDetails: (payload: any, reportId?: number) => {
    const headers = reportId
      ? { 'X-Report-Id': reportId }
      : {};
    return apiClient.post('/report-item-details', payload, { headers });
  },
  createLocation(payload: any) {
    return apiClient.post('/report-location-details/create', payload);
  },
  createContact(payload: any) {
    return apiClient.post('/report-contact-info/create', payload);
  },
  uploadImage(file: File, itemId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', String(itemId));
    return apiClient.post('/items/upload-image', formData);
  },
};