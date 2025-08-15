import { mainApiClient } from '../api/client';
import type { Category } from '../types/api';

export interface BackendCategoryResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: Category | Category[] | null;
  errors: any;
  baseEntity: any;
}

export class CategoryService {
  static async getCategories(params?: { isActive?: boolean; pageSize?: number; page?: number }): Promise<Category[]> {
    try {
      const queryParams = new URLSearchParams({
        isActive: String(params?.isActive ?? false),
        pageSize: String(params?.pageSize ?? 100),
        page: String(params?.page ?? 1),
      }).toString();
      const response = await mainApiClient.request<BackendCategoryResponse>(`/categories?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
      });
      // If paginated, data is an array in data.data
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray((response.data as any).data)) {
        return (response.data as any).data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    try {
      const response = await mainApiClient.request<BackendCategoryResponse>(`/categories/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data as Category;
      }
      return null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  static async createCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
    try {
      const response = await mainApiClient.request<BackendCategoryResponse>('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data as Category;
      }
      return null;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  static async updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
    try {
      const response = await mainApiClient.request<BackendCategoryResponse>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.data && !Array.isArray(response.data)) {
        return response.data as Category;
      }
      return null;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  static async deleteCategory(id: number): Promise<boolean> {
    try {
      await mainApiClient.request<BackendCategoryResponse>(`/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
}

export default CategoryService;