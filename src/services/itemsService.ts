import { mainApiClient } from '../api/client';
import type { SearchParams, CreateItemRequest, Item } from '../types/api';

export class ItemsService {
  static getWatchListByUser(userId: any, watchListCurrentPage: number) {
    throw new Error('Method not implemented.');
  }
  static async createReport(reportData: any) {
    return mainApiClient.request('/reports/create', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  static async getReportsByUser(userId: string, nextPage: number) {
    return mainApiClient.request(`/reports/all?userId=${userId}`, {
      method: 'GET'
    });
  }
  async getReports(userId: string, page: number) {
    return mainApiClient.request(`/reports/all?userId=${userId}&page=${page}`, {
      method: 'GET'
    });
  }
  async getWatchListByUser(userId: string) {
    return mainApiClient.request(`/reports/all/${userId}`,{
      method: 'GET'
    });
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