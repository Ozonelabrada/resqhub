import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';

export const useHubAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const auth = useAuth();

  // Keep in sync with the central AuthContext state
  useEffect(() => {
    setIsAuthenticated(!!auth?.isAuthenticated);
    setUserData(auth?.user || null);
  }, [auth?.isAuthenticated, auth?.user]);

  const logout = () => {
    // Delegate to central auth context
    auth.logout();
  };

  return {
    isAuthenticated,
    userData,
    logout
  };
};