// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../types/personalHub';

export const useUserProfile = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!auth?.token) {
      navigate('/signin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUserId = UserService.getCurrentUserId();

      if (!currentUserId) {
        throw new Error('No user ID found');
      }

      const backendUserData = await UserService.getCurrentUser(currentUserId);
      const transformedUserData = UserService.transformUserData(backendUserData);

      setUserData(transformedUserData);
      localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));

    } catch (err) {
      console.error('Error fetching user data:', err);

      // Fallback to localStorage
      const localUserData = localStorage.getItem('publicUserData');
      if (localUserData) {
        try {
          const parsedUser = JSON.parse(localUserData);
          setUserData(parsedUser);
        } catch (parseError) {
          console.error('Error parsing local user data:', parseError);
          navigate('/signin');
        }
      } else {
        setError('Failed to load user profile');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userData) return false;

    try {
      const updatedUser = await UserService.updateUserProfile(userData.id, updates);
      const transformedUserData = UserService.transformUserData(updatedUser);

      setUserData(transformedUserData);
      localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));
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
      if (e.key === 'publicUserToken') {
        if (!e.newValue) {
          navigate('/signin');
        } else {
          fetchUserProfile();
        }
      }
    };

    const handleFocus = () => {
      if (!auth?.token) {
        navigate('/signin');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
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