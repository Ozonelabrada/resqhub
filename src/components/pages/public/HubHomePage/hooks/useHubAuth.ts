import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { AuthService } from '../../../../../services/authService';

export const useHubAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const auth = useAuth();

  // Keep in sync with the central AuthContext state
  useEffect(() => {
    setIsAuthenticated(!!auth?.isAuthenticated);
    setUserData(auth?.user || null);
  }, [auth?.isAuthenticated, auth?.user]);

  const logout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Delegate session clearing to the central auth context
      auth.logout();
    }
  };

  return {
    isAuthenticated,
    userData,
    logout
  };
};