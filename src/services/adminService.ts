import api from '../api/client';

export interface BackendAdminData {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  profilePicture?: string;
  role: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendAdminResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: BackendAdminData;
  errors: null;
  baseEntity: null;
}

export class AdminService {
  static async getCurrentAdmin(adminId?: string): Promise<BackendAdminData> {
    try {
      let adminIdToUse = adminId;
      if (!adminIdToUse) {
        const adminData = localStorage.getItem('adminUserData');
        if (adminData) {
          try {
            const parsedAdmin = JSON.parse(adminData);
            adminIdToUse = parsedAdmin.id;
          } catch (error) {
            console.error('Error parsing admin data from localStorage:', error);
          }
        }
      }
      if (!adminIdToUse) {
        throw new Error('Admin ID is required to fetch admin profile');
      }
      const response = await api.get<BackendAdminResponse>(`/admin/${adminIdToUse}`);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to fetch admin profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
  }

  static async updateAdminProfile(adminId: string, updates: Partial<BackendAdminData>): Promise<BackendAdminData> {
    try {
      const response = await api.put<BackendAdminResponse>(`/admin/${adminId}`, updates);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to update admin profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }

  static async getAdminById(adminId: string): Promise<BackendAdminData> {
    try {
      const response = await api.get<BackendAdminResponse>(`/admin/${adminId}`);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to fetch admin profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin by ID:', error);
      throw error;
    }
  }

  static getCurrentAdminId(): string | null {
    try {
      const adminData = localStorage.getItem('adminUserData');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        return parsedAdmin.id || null;
      }
    } catch (error) {
      console.error('Error getting current admin ID:', error);
    }
    return null;
  }
}

export default AdminService;