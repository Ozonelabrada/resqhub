import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userData: any;
  token: string | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (token: string, user: any, isAdmin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchAuth = () => {
      // Check for admin first, then public
      const adminToken =
        localStorage.getItem('adminToken') ||
        document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] ||
        null;
      const adminUser = localStorage.getItem('adminUserData') || null;

      const publicToken =
        localStorage.getItem('publicUserToken') ||
        document.cookie.split('; ').find(row => row.startsWith('publicUserToken='))?.split('=')[1] ||
        null;
      const publicUser = localStorage.getItem('publicUserData') || null;

      if (adminToken && adminUser) {
        setToken(adminToken);
        setUserData(JSON.parse(adminUser));
        setIsAuthenticated(true);
      } else if (publicToken && publicUser) {
        setToken(publicToken);
        setUserData(JSON.parse(publicUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        setToken(null);
      }
    };

    fetchAuth();
    window.addEventListener('storage', fetchAuth);
    return () => window.removeEventListener('storage', fetchAuth);
  }, [location]);

  const login = (token: string, user: any, isAdmin = false) => {
    setIsAuthenticated(true);
    setUserData(user);
    setToken(token);
    if (isAdmin) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUserData', JSON.stringify(user));
      document.cookie = `adminToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    } else {
      localStorage.setItem('publicUserToken', token);
      localStorage.setItem('publicUserData', JSON.stringify(user));
      document.cookie = `publicUserToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUserData');
    localStorage.removeItem('publicUserToken');
    localStorage.removeItem('publicUserData');
    document.cookie = 'adminToken=; Max-Age=0; path=/;';
    document.cookie = 'publicUserToken=; Max-Age=0; path=/;';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, token, setIsAuthenticated, setUserData, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);