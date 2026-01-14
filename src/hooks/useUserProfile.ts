// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { authManager } from '../utils/sessionManager';
import { STORAGE_KEYS } from '../constants';
import type { UserProfile } from '../types/personalHub';

export const useUserProfile = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!authManager.isAuthenticated()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUserId = UserService.getCurrentUserId();

      const backendUserData = await UserService.getCurrentUser(currentUserId || undefined);
      const transformedUserData = UserService.transformUserData(backendUserData);

      setUserData(transformedUserData);
      // Update authManager with fresh user data
      const token = authManager.getToken();
      if (token) {
        authManager.setSession(token, transformedUserData as any);
      }

    } catch (err) {
      console.error('Error fetching user data:', err);

      // Fallback to authManager
      const localUser = authManager.getUser();
      if (localUser) {
        setUserData(localUser as any);
      } else {
        setError('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userData) return false;

    try {
      const updatedUser = await UserService.updateUserProfile(userData.id as string, updates as any);
      const transformedUserData = UserService.transformUserData(updatedUser);

      setUserData(transformedUserData);
      // Update authManager with fresh user data
      if (auth?.token) {
        authManager.setSession(auth.token, transformedUserData as any);
      }
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TOKEN) {
        if (e.newValue) {
          fetchUserProfile();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, auth?.token]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserProfile,
    updateProfile
  };
};