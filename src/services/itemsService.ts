import { mainApiClient } from '../api/client';
import type { SearchParams, CreateItemRequest, Item } from '../types/api';

export class ItemsService {
  // Main report creation
  static async createReport(reportData: any) {
    return mainApiClient.request('/reports/create', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Report item details creation
  static async createReportItemDetails(itemDetailsData: any) {
    return mainApiClient.request('/report-item-details/create', {
      method: 'POST',
      body: JSON.stringify(itemDetailsData),
    });
  }

  // Report contact info creation
  static async createReportContactInfo(contactInfoData: any) {
    return mainApiClient.request('/report-contact-info/create', {
      method: 'POST',
      body: JSON.stringify(contactInfoData),
    });
  }

  // Report location details creation
  static async createReportLocationDetails(locationDetailsData: any) {
    return mainApiClient.request('/report-location-details/create', {
      method: 'POST',
      body: JSON.stringify(locationDetailsData),
    });
  }

  // NEW: Get categories from backend
  static async getCategories(pageSize: number = 100, page: number = 1) {
    return mainApiClient.request(`/categories?pageSize=${pageSize}&page=${page}`, {
      method: 'GET'
    });
  }

  // NEW: Get items for suggestions
  static async getItems(isActive: boolean = true, pageSize: number = 100, page: number = 1) {
    return mainApiClient.request(`/items?isActive=${isActive}&pageSize=${pageSize}&page=${page}`, {
      method: 'GET'
    });
  }

  // NEW: Get report images
  static async getReportImages(reportId: number) {
    return mainApiClient.request(`/report-images/report/${reportId}`, {
      method: 'GET'
    });
  }

  // NEW: Upload image (assuming this endpoint exists)
  static async uploadImage(imageFile: File, reportId?: number) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (reportId) {
      formData.append('reportId', reportId.toString());
    }

    return mainApiClient.request('/images/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData, let browser set it
      headers: undefined
    });
  }

  // Get reports by user
  static async getReportsByUser(userId: string, nextPage: number) {
    return mainApiClient.request(`/reports/all?userId=${userId}`, {
      method: 'GET'
    });
  }

  // Instance methods for backward compatibility
  async getReports(userId: string, page: number) {
    return mainApiClient.request(`/reports/all?userId=${userId}&page=${page}`, {
      method: 'GET'
    });
  }

  async getWatchListByUser(userId: string) {
    return mainApiClient.request(`/reports/all/${userId}`, {
      method: 'GET'
    });
  }

  static getWatchListByUser(userId: any, watchListCurrentPage: number) {
    throw new Error('Method not implemented.');
  }

  async searchItems(params: SearchParams) {
    return mainApiClient.request('/items/search', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async createItem(item: CreateItemRequest) {
    return mainApiClient.request('/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateItem(id: number, updates: Partial<Item>) {
    return mainApiClient.request(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
}