import { authApiClient, mainApiClient } from "../api/client";
import type { SignInRequest, SignUpRequest, AuthResponse, OAuth2CallbackResponse } from "../types";

export class AuthService {
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await authApiClient.request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Only store token and user data if the request was successful
      if (response && response.succeeded === true) {
        if (response.token) {
          localStorage.setItem('publicUserToken', response.token);
        }
        if (response.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.user));
        }
        // Also check for alternative response structure
        if (response.data?.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data?.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }

      // Return the full response (both success and failure cases)
      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      // Re-throw the error so the UI can handle it
      throw error;
    }
  }

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await authApiClient.request<AuthResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include credentials
      });

      // Store token and user data if successful
      if (response && response.succeeded) {
        if (response.token) {
          localStorage.setItem('publicUserToken', response.token);
        }
        if (response.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.user));
        }
        // Also check for alternative response structure
        if (response.data?.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data?.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Start Google OAuth2 flow - redirects to your backend
  async startGoogleLogin(): Promise<void> {
    // Store current location for redirect after auth
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('returnPath', currentPath);
    
    // Redirect to your backend Google OAuth2 endpoint
    // The backend will handle the OAuth2 flow and redirect back to the frontend
    window.location.href = `${import.meta.env.REACT_APP_API_BASE_URL}/auth/google`;
  }

  // Handle OAuth2 callback
  async handleOAuth2Callback(code: string, state?: string): Promise<OAuth2CallbackResponse> {
    try {
      const response = await authApiClient.request<OAuth2CallbackResponse>('/callback', {
        method: 'POST',
        body: JSON.stringify({ code, state }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include credentials for OAuth2
      });

      // Store token and user data if successful
      if (response && response.succeeded) {
        if (response.token) {
          localStorage.setItem('publicUserToken', response.token);
        }
        if (response.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.user));
        }
        // Also check for alternative response structure
        if (response.data?.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data?.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error) {
      console.error('OAuth2 callback error:', error);
      throw error;
    }
  }

  // Complete OAuth2 registration with additional user data
  async completeOAuth2Registration(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await authApiClient.request<AuthResponse>('/oauth2/complete', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include credentials
      });

      // Store token and user data if successful
      if (response && response.succeeded) {
        if (response.token) {
          localStorage.setItem('publicUserToken', response.token);
        }
        if (response.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.user));
        }
        // Also check for alternative response structure
        if (response.data?.token) {
          localStorage.setItem('publicUserToken', response.data.token);
        }
        if (response.data?.user) {
          localStorage.setItem('publicUserData', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error) {
      console.error('OAuth2 registration completion error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Include credentials in logout request
      await authApiClient.request('/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('publicUserToken');
      localStorage.removeItem('publicUserData');
      localStorage.removeItem('tempOAuth2UserData');
      localStorage.removeItem('returnPath');
      localStorage.removeItem('intendedAction');
    }
  }

  // Get current user info (if needed)
  async getCurrentUser(): Promise<any> {
    try {
      return await authApiClient.request('/me', {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Get current user error:', error);
      // Clear tokens on auth failure
      localStorage.removeItem('publicUserToken');
      localStorage.removeItem('publicUserData');
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('publicUserToken');
    const userData = localStorage.getItem('publicUserData');
    return !!(token && userData);
  }

  // Get stored user data
  getUserData(): any | null {
    try {
      const userData = localStorage.getItem('publicUserData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get current user profile using token
  static async getCurrentUserProfile() {
    return mainApiClient.request('/auth/profile', {
      method: 'GET',
      // Token will be automatically added by the mainApiClient
    });
  }

  // Login (if needed)
  static async login(credentials: { email: string; password: string }) {
    return mainApiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
}