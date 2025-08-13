import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import { useLocation } from 'react-router-dom';

interface UserProfileResponse {
  data?: any;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: any;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const token = localStorage.getItem('publicUserToken');
        if (!token) {
          const userProfile = await AuthService.getCurrentUserProfile() as UserProfileResponse;
          if (userProfile?.data) {
            setIsAuthenticated(true);
            setUserData(userProfile.data);
          } else {
            setIsAuthenticated(false);
            setUserData(null);
          }
        } else {
          setIsAuthenticated(true);
          // Optionally, fetch user data if needed when token exists
        }
      } catch {
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    fetchAuth();
    window.addEventListener('storage', fetchAuth);
    return () => window.removeEventListener('storage', fetchAuth);
  }, [location]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, setIsAuthenticated, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);