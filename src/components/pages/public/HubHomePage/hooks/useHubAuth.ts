import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { AuthService } from '../../../../../services/authService';

export const useHubAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const auth = useAuth();
  const token = auth?.token;
  const authUserData = auth?.userData;

  useEffect(() => {
    setIsAuthenticated(!!token);
    if (authUserData) {
      try {
        const parsedUser = typeof authUserData === 'string' ? JSON.parse(authUserData) : authUserData;
        setUserData(parsedUser);
      } catch (error) {
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  }, [token, authUserData]);

  const logout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('publicUserToken');
      localStorage.removeItem('publicUserData');
      setIsAuthenticated(false);
      setUserData(null);
      window.location.reload();
    }
  };

  return {
    isAuthenticated,
    userData,
    logout
  };
};