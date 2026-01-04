import React, { createContext, useContext, useEffect, useState } from 'react';
import { authManager } from '../utils/sessionManager';
import { AuthService } from '../services/authService';
import type { UserData as User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(authManager.getUser());

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
            if (response?.succeeded && response?.data) {
              const token = authManager.getToken();
              if (token) {
                authManager.setSession(token, response.data);
              }
            }
          }
        } catch (error: any) {
          // If 401, the interceptor already called authManager.logout()
          // which will trigger handleAuthChange via the listener
          console.warn('Token validation failed on init');
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
      const response = await AuthService.signIn({ email, password });
      
      // Check if the response indicates success
      if (!response?.succeeded) {
        throw new Error(response?.message || 'Login failed');
      }
      
      // Extract token and user from the response structure
      const user = response?.data?.user;
      const token = user?.token;
      
      if (token && user) {
        // Remove token from user object before storing and normalize role
        const { token: _, ...userWithoutToken } = user;
        const normalizedUser = {
          ...userWithoutToken,
          role: userWithoutToken.role === '0' ? 'user' : userWithoutToken.role
        };
        authManager.setSession(token, normalizedUser);
      } else {
        throw new Error('Invalid login response: missing token or user data');
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
      logout
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