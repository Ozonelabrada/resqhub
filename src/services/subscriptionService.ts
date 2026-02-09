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

export interface Subscription {
  id: number;
  userId: string;
  communityId: number;
  planId: number;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: string | null;
  endDate: string | null;
  stripeSubscriptionId: string | null;
  dateCreated: string;
  lastModifiedDate: string;
  planName: string;
  planCode: string;
  monthlyPrice: number;
  annualPrice: number;
  communityName?: string;
  features: string[];
  addOns: string[];
}

export interface SubscriptionsResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: {
    subscriptions: Subscription[];
    totalCount: number;
    pageSize: number;
    page: number;
    totalPages: number;
  };
  errors: string[] | null;
}

export const SubscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get<{ data: { plans: SubscriptionPlan[] } }>('/plans?isActive=true&page=1&pageSize=50');
      if (response.data.data?.plans) {
        return response.data.data.plans;
      }
      return [];
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
  },

  async getAllSubscriptions(pageSize = 10, page = 1): Promise<Subscription[]> {
    try {
      const response = await api.get<SubscriptionsResponse>(
        `/subscriptions/all?pageSize=${pageSize}&page=${page}`
      );
      if (response.data.succeeded && response.data.data.subscriptions) {
        return response.data.data.subscriptions;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      return [];
    }
  }
};
