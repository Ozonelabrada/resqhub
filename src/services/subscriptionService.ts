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

export interface AddOn {
  id: number;
  name: string;
  code: string;
  description: string;
  type: string;
  isActive: boolean;
  monthlyPrice: number;
  oneTimePrice: number | null;
  dateCreated: string;
  lastModifiedDate: string;
}

export interface AddOnsResponse {
  features: AddOn[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const SubscriptionService = {
  async getPlans(isActive: boolean = true, page: number = 1, pageSize: number = 10): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get<{ data: SubscriptionPlansResponse }>(
        `/plans?isActive=${isActive}&page=${page}&pageSize=${pageSize}`
      );
      const plans = response.data?.data?.plans || [];
      return plans;
    } catch (error) {
      return [];
    }
  },

  async getCurrentSubscription(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get<{ data: SubscriptionStatus }>('/subscriptions/status');
      return response.data?.data || { isActive: false, isPremium: false };
    } catch (error) {
      return { isActive: false, isPremium: false };
    }
  },

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    try {
      const response = await api.get<UserSubscriptionsResponse>(`/subscriptions/user/${userId}`);
      return response.data?.data || [];
    } catch (error) {
      return [];
    }
  },

  async subscribe(planId: string): Promise<{ checkoutUrl: string } | null> {
    try {
      const response = await api.post<{ data: { checkoutUrl: string } }>('/subscriptions/checkout', { planId });
      return response.data?.data || null;
    } catch (error) {
      return null;
    }
  },

  async getAddOns(isActive: boolean = true, page: number = 1, pageSize: number = 50): Promise<AddOn[]> {
    try {
      const response = await api.get<{ data: AddOnsResponse }>(
        `/Features?isActive=${isActive}&type=addOns&pageSize=${pageSize}&page=${page}`
      );
      const addOns = response.data?.data?.features || [];
      return addOns;
    } catch (error) {
      return [];
    }
  }
};
