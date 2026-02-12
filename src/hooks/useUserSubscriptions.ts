import { useEffect, useState } from 'react';
import { SubscriptionService, type UserSubscription } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';

interface UseUserSubscriptionsReturn {
  subscriptions: UserSubscription[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserSubscriptions = (): UseUserSubscriptionsReturn => {
  const { user } = useAuth();
  
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await SubscriptionService.getUserSubscriptions(String(user.id));
      setSubscriptions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(errorMessage);
      console.error('Failed to fetch user subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user?.id]);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
  };
};
