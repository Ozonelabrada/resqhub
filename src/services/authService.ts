import api from "../api/client";
import type { SignInRequest, SignUpRequest, AuthResponse, OAuth2CallbackResponse } from "../types";

export class AuthService {
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const user = response.data?.data?.user;
      if (user && response.data?.token) {
        localStorage.setItem('publicUserToken', response.data.token);
        localStorage.setItem('publicUserData', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      if (response.data?.succeeded) {
        if (response.data.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async startGoogleLogin(): Promise<void> {
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('returnPath', currentPath);
    window.location.href = `${import.meta.env.VITE_APP_API_BASE_URL}/auth/google`;
  }

  static async handleOAuth2Callback(code: string, state?: string): Promise<OAuth2CallbackResponse> {
    try {
      const response = await api.post<OAuth2CallbackResponse>('/callback', { code, state });
      if (response.data?.succeeded) {
        if (response.data.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('OAuth2 callback error:', error);
      throw error;
    }
  }

  static async completeOAuth2Registration(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/oauth2/complete', userData);
      if (response.data?.succeeded) {
        if (response.data.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('OAuth2 registration completion error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('publicUserToken');
      localStorage.removeItem('publicUserData');
      localStorage.removeItem('tempOAuth2UserData');
      localStorage.removeItem('returnPath');
      localStorage.removeItem('intendedAction');
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('publicUserToken');
      localStorage.removeItem('publicUserData');
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('publicUserToken');
    const userData = localStorage.getItem('publicUserData');
    return !!(token && userData);
  }

  static getUserData(): any | null {
    try {
      const userData = localStorage.getItem('publicUserData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  static async getCurrentUserProfile() {
    return api.get('/auth/profile');
  }

  static async login(credentials: { email: string; password: string }) {
    return api.post('/auth/login', credentials);
  }
}