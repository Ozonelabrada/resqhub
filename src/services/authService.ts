import api from "../api/client";
import type { SignInRequest, SignUpRequest, AuthResponse, OAuth2CallbackResponse } from "../types";

export class AuthService {
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async startGoogleLogin(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_APP_API_BASE_URL}/auth/google`;
  }

  static async handleOAuth2Callback(code: string, state?: string): Promise<OAuth2CallbackResponse> {
    try {
      const response = await api.post<OAuth2CallbackResponse>('/callback', { code, state });
      return response.data;
    } catch (error) {
      console.error('OAuth2 callback error:', error);
      throw error;
    }
  }

  static async completeOAuth2Registration(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/oauth2/complete', userData);
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
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
}
