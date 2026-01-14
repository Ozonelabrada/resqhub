import api from '../api/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId?: string;
  expiryDate?: string;
  isPremium: boolean;
}

export const SubscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      // Mocked for now, but following the pattern
      return [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month',
          features: ['Join communities', 'Create basic posts', 'Standard approval time']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 29,
          interval: 'month',
          features: ['Instant community approval', 'Unlimited communities', 'Priority support', 'Verified badge']
        }
      ];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  async getCurrentSubscription(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get<{ data: SubscriptionStatus }>('/subscriptions/status');
      return response.data?.data || { isActive: false, isPremium: false };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return { isActive: false, isPremium: false };
    }
  },

  async subscribe(planId: string): Promise<{ checkoutUrl: string } | null> {
    try {
      const response = await api.post<{ data: { checkoutUrl: string } }>('/subscriptions/checkout', { planId });
      return response.data?.data || null;
    } catch (error) {
      console.error('Error initiating subscription:', error);
      return null;
    }
  }
};
