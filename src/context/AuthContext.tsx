import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authManager } from '../utils/sessionManager';
import { AuthService } from '../services/authService';
import type { UserData as User, SignUpRequest } from '../types';
import LogoutModal from '../components/modals/Auth/LogoutModal';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
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
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  isLogoutModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as false, validate later
  const [token, setToken] = useState<string | null>(null); // Start as null
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Start as null
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      // Check if there's a stored token
      const storedToken = authManager.getToken();
      const storedUser = authManager.getUser();

      if (storedToken && storedUser) {
        try {
          // Verify token by fetching user data
          const response = await AuthService.getCurrentUser(String(storedUser.id));
          
          // If successful, update the session with fresh data
          const freshUser = response?.data || (response?.id ? response : null);
          
          if (freshUser) {
            authManager.setSession(storedToken, freshUser);
            // Now set the authenticated state
            setIsAuthenticated(true);
            setToken(storedToken);
            setUser(freshUser);
          } else {
            // Invalid response, clear auth
            authManager.logout();
          }
        } catch (error: any) {
          console.warn('Token validation failed on init:', error.message);
          // Clear invalid auth
          authManager.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const handleAuthChange = (updatedUser: User | null) => {
      setIsAuthenticated(!!updatedUser);
      setToken(authManager.getToken());
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
      if (response && 'succeeded' in response && !response.succeeded) {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Sign up error details:', error);
      // Extract backend error message if available
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const performLogout = (): void => {
    authManager.logout();
  };

  const handleConfirmLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      closeLogoutModal();
      performLogout();
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      token,
      isLoading,
      user,
      login,
      signup,
      logout: openLogoutModal, // Use confirmation instead of direct logout
      openLoginModal,
      closeLoginModal,
      isLoginModalOpen,
      openSignUpModal,
      closeSignUpModal,
      isSignUpModalOpen,
      openSettingsModal,
      closeSettingsModal,
      isSettingsModalOpen,
      openLogoutModal,
      closeLogoutModal,
      isLogoutModalOpen
    }}>
      {children}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={handleConfirmLogout}
      />
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