import { useState, useEffect } from 'react';
import { UserService, type BackendUserData } from '@/services/userService';

export const useFetchUserProfile = (userId: string | null) => {
  const [userData, setUserData] = useState<BackendUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const backendUserData = await UserService.getUserById(userId);
        setUserData(backendUserData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { userData, loading, error };
};
