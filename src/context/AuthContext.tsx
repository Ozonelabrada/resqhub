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
    const initAuth = () => {
      setIsAuthenticated(authManager.isAuthenticated());
      setUser(authManager.getUser());
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
      
      if (response?.token && response?.user) {
        authManager.setSession(response.token, response.user);
      } else {
        throw new Error('Invalid login response');
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