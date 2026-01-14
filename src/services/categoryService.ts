import api from '../api/client';
import publicApiClient from '../api/publicClient';
import type { Category, CategoryResponse } from '../types';

export interface BackendCategoryResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: Category | Category[] | any | null;
  errors: any;
  baseEntity: any;
}

export class CategoryService {
  static async getCategories(params?: { isActive?: boolean; pageSize?: number; page?: number }): Promise<Category[]> {
    try {
      // Only add isActive if it is explicitly set (not undefined or null)
      const query: Record<string, string> = {};
      if (typeof params?.isActive === 'boolean') {
        query.isActive = String(params.isActive);
      }
      if (params?.pageSize) query.pageSize = String(params.pageSize);
      if (params?.page) query.page = String(params.page);

      const queryParams = new URLSearchParams(query).toString();
      const url = queryParams ? `/categories?${queryParams}` : '/categories';

      const response = await api.request<any>({
        url,
        method: 'GET',
      });

      console.log('Raw Category API Response:', response.data);

      // Handle triple data nesting: response.data.data.data
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      
      // Handle double nesting: response.data.data
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Handle direct array in body
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle "succeeded" wrapper without extra nesting
      if (response.data?.succeeded && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    try {
      const response = await api.request<BackendCategoryResponse>({
        url: `/categories/${id}`,
        method: 'GET',
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data.data as unknown as Category;
      }
      return null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  static async createCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
    try {
      const response = await api.request<BackendCategoryResponse>({
        url: '/categories',
        method: 'POST',
        data: category,
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data.data as Category;
      }
      return null;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  static async updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
    try {
      const response = await api.request<BackendCategoryResponse>({
        url: `/categories/${id}`,
        method: 'PUT',
        data: updates,
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data.data as Category;
      }
      return null;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  static async deleteCategory(id: number): Promise<boolean> {
    try {
      await api.request<BackendCategoryResponse>({
        url: `/categories/${id}`,
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
}

export default CategoryService;