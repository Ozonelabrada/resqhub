import api from '../api/client';
import { authManager } from '../utils/sessionManager';

export interface BackendUserData {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  profilePicture: string;
  coverPhoto: string | null;
  bio: string | null;
  location: string | null;
  joinDate: string;
  emailVerified: boolean;
  verificationStatus: number;
  successfulReturns: number;
  helpedPeople: number;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendUserResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: BackendUserData;
  errors: null;
  baseEntity: null;
}

export class UserService {
  static async getCurrentUser(userId?: string): Promise<BackendUserData> {
    try {
      // If userId is not provided, try to get it from authManager
      let userIdToUse = userId;
      if (!userIdToUse) {
        const user = authManager.getUser();
        if (user) {
          userIdToUse = String(user.id);
        }
      }

      if (!userIdToUse) {
        throw new Error('User ID is required to fetch user profile');
      }

      const response = await api.get<BackendUserResponse>(`/users/${userIdToUse}`);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to fetch user profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<BackendUserData>): Promise<BackendUserData> {
    try {
      const response = await api.put<BackendUserResponse>(`/users/${userId}`, updates);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to update user profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<BackendUserData> {
    try {
      const response = await api.get<BackendUserResponse>(`/users/${userId}`);
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to fetch user profile');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static transformUserData(backendUser: BackendUserData) {
    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name || backendUser.fullName || 'User Name',
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      fullName: backendUser.fullName || backendUser.name || 'User Name',
      username: backendUser.username || backendUser.email?.split('@')[0] || 'username',
      profilePicture: backendUser.profilePicture || null,
      coverPhoto: backendUser.coverPhoto || null,
      bio: backendUser.bio || 'Helping reunite lost items with their owners 🔍',
      location: backendUser.location || 'Location not set',
      joinDate: backendUser.joinDate || backendUser.createdAt,
      emailVerified: backendUser.emailVerified,
      verificationStatus: this.getVerificationStatusText(backendUser.verificationStatus),
      successfulReturns: backendUser.successfulReturns || 0,
      helpedPeople: backendUser.helpedPeople || 0,
      role: this.getRoleText(backendUser.role),
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt
    };
  }

  private static getVerificationStatusText(status: number): string {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'verified';
      case 2: return 'rejected';
      default: return 'pending';
    }
  }

  private static getRoleText(role: number): string {
    switch (role) {
      case 0: return 'user';
      case 1: return 'admin';
      case 2: return 'moderator';
      default: return 'user';
    }
  }

  static getCurrentUserId(): string | null {
    const user = authManager.getUser();
    return user ? String(user.id) : null;
  }
}