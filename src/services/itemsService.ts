import api from '../api/client';
import type { SearchParams } from '../types/api';

export class ItemsService {
  // Main report creation
  static async createReport(reportData: any) {
    return api.post('/reports/create', reportData);
  }

  // Report item details creation
  static async createReportItemDetails(itemDetailsData: any) {
    return api.post('/report-item-details/create', itemDetailsData);
  }

  // Report contact info creation
  static async createReportContactInfo(contactInfoData: any) {
    return api.post('/report-contact-info/create', contactInfoData);
  }

  // Report location details creation
  static async createReportLocationDetails(locationDetailsData: any) {
    return api.post('/report-location-details/create', locationDetailsData);
  }

  // Get categories from backend
  static async getCategories(pageSize: number = 100, page: number = 1) {
    return api.get(`/categories?pageSize=${pageSize}&page=${page}`);
  }

  // Get items for suggestions
  static async getItems(isActive: boolean = true, pageSize: number = 100, page: number = 1) {
    return api.get(`/items?isActive=${isActive}&pageSize=${pageSize}&page=${page}`);
  }

  // Get report images
  static async getReportImages(reportId: number) {
    return api.get(`/report-images/report/${reportId}`);
  }

  // Upload report image (assuming this endpoint exists)
  static async uploadReportImage(imageFile: File, reportId?: number) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (reportId) {
      formData.append('reportId', reportId.toString());
    }
    return api.post('/images/upload', formData);
  }

  // Get reports by user
  static async getReportsByUser(userId: string, _nextPage: number) {
    return api.get(`/reports/all?userId=${userId}`);
  }

  // Instance methods for backward compatibility
  async getReports(userId: string, page: number) {
    return api.get(`/reports/all?userId=${userId}&page=${page}`);
  }

  async getWatchListByUser(userId: string) {
    return api.get(`/reports/all/${userId}`);
  }

  async searchItems(params: SearchParams) {
    return api.post('/items/search', params);
  }

  static async createItem(payload: any) {
    return api.post('/items', payload);
  }
  static async createItemDetails(payload: any) {
    return api.post('/item-details', payload);
  }
  static async createLocation(payload: any) {
    return api.post('/locations', payload);
  }
  static async createContact(payload: any) {
    return api.post('/contacts', payload);
  }
  static async uploadImage(file: File, itemId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', String(itemId));
    return api.post('/items/upload-image', formData);
  }
}