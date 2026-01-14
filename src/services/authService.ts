import api from "../api/client";
import type { SignInRequest, SignUpRequest, AuthResponse } from "../types";

export class AuthService {
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      // Try /auth/login first, then fallback to /login if it fails with 404
      try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          const response = await api.post<AuthResponse>('/login', credentials);
          return response.data;
        }
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      // Try /register first, then fallback to /auth/register
      try {
        const response = await api.post<AuthResponse>('/register', userData);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          const response = await api.post<AuthResponse>('/auth/register', userData);
          return response.data;
        }
        throw error;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  static async getCurrentUser(userId?: string): Promise<any> {
    try {
      // If userId is not provided, the backend should ideally have a /me endpoint
      // but for now we'll use the provided ID or fallback to a default if absolutely necessary
      const idToUse = userId || 'me'; 
      const response = await api.get('/users/' + idToUse);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
}
