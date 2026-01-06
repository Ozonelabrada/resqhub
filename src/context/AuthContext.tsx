import React, { createContext, useContext, useEffect, useState } from 'react';
import { authManager } from '../utils/sessionManager';
import { AuthService } from '../services/authService';
import type { UserData as User, SignUpRequest } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignUpRequest) => Promise<void>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
  openSignUpModal: () => void;
  closeSignUpModal: () => void;
  isSignUpModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(authManager.getUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignUpModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      if (authManager.isAuthenticated()) {
        try {
          const userData = authManager.getUser();
          if (userData) {
            // Verify token by fetching user data - pass the actual ID
            const response = await AuthService.getCurrentUser(String(userData.id));
            
            // If successful, update the session with fresh data
            // Handle both { succeeded: true, data: user } and direct user object response
            const freshUser = response?.data || (response?.id ? response : null);
            
            if (freshUser) {
              const token = authManager.getToken();
              if (token) {
                authManager.setSession(token, freshUser);
              }
            }
          }
        } catch (error: any) {
          console.warn('Token validation failed on init:', error.message);
          // If it's a 401, the interceptor will handle logout
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const handleAuthChange = (updatedUser: User | null) => {
      setIsAuthenticated(!!updatedUser);
      setUser(updatedUser);
    };

    authManager.addListener(handleAuthChange);

    return () => {
      authManager.removeListener(handleAuthChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login for:', email);
      const response = await AuthService.signIn({ email, password });
      console.log('Login response:', response);
      
      // Extract token and user from the response structure
      // Handle multiple possible response formats from the backend
      let user = response?.data?.user || response?.user;
      let token = response?.token || user?.token;
      
      if (!token && response?.data && (response.data as any).token) {
        token = (response.data as any).token;
      }

      // If we have a token and user, consider it a success even if 'succeeded' flag is missing
      if (token && user) {
        // Remove token from user object if it exists there to avoid redundancy in storage
        const { token: _, ...userWithoutToken } = user as any;
        
        // Normalize user data
        const normalizedUser = {
          ...userWithoutToken,
          // Ensure role is a string if it comes as a number
          role: String(userWithoutToken.role) === '0' ? 'user' : String(userWithoutToken.role)
        };
        
        authManager.setSession(token, normalizedUser);
        console.log('Login successful, session set');
      } else {
        // If we don't have token/user, check the succeeded flag or message
        if (response && 'succeeded' in response && !response.succeeded) {
          throw new Error(response.message || 'Login failed');
        }
        console.error('Login response missing data:', { hasToken: !!token, hasUser: !!user });
        throw new Error('Invalid login response: missing token or user data');
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      // Re-throw with a user-friendly message if possible
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (userData: SignUpRequest): Promise<void> => {
    try {
      const response = await AuthService.signUp(userData);
      if (!response?.succeeded) {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    authManager.logout();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login,
      signup,
      logout,
      openLoginModal,
      closeLoginModal,
      isLoginModalOpen,
      openSignUpModal,
      closeSignUpModal,
      isSignUpModalOpen,
      openSettingsModal,
      closeSettingsModal,
      isSettingsModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};