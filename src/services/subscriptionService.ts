import api from '../api/client';

export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isActive: boolean;
  features: any[];
  status: string;
  subscribersCount: number;
  dateCreated: string;
  lastModifiedDate: string;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  totalCount: number;
  pageSize: number;
  page: number;
  totalPages: number;
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId?: string;
  expiryDate?: string;
  isPremium: boolean;
}

export interface UserSubscription {
  id: number;
  userId: string;
  communityId: number;
  planId: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired' | 'Cancelled';
  startDate: string;
  endDate: string;
  stripeSubscriptionId: string | null;
  dateCreated: string;
  lastModifiedDate: string;
  planName: string;
  planCode: string;
  monthlyPrice: number;
  annualPrice: number;
  communityName: string | null;
  features: string[];
  addOns: any[];
}

export interface UserSubscriptionsResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: UserSubscription[];
  errors: any;
  baseEntity: any;
}

export const SubscriptionService = {
  async getPlans(isActive: boolean = true, page: number = 1, pageSize: number = 10): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get<{ data: SubscriptionPlansResponse }>(
        `/plans?isActive=${isActive}&page=${page}&pageSize=${pageSize}`
      );
      
      console.log('Full API response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data.plans:', response.data?.data?.plans);
      
      const plans = response.data?.data?.plans || [];
      console.log(`Retrieved ${plans.length} plans from API`);
      return plans;
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

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    try {
      const response = await api.get<UserSubscriptionsResponse>(`/subscriptions/user/${userId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
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
