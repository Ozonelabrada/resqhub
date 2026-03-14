import apiClient from '../api/client';

export interface RiderInfo {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreditTransaction {
  id: number;
  creditCount: number;
  creditsUsed: number;
  creditsRemaining: number;
  value: number;
  transactionType: 'purchase' | 'admin_grant' | 'promotion' | 'refund';
  status: 'active' | 'exhausted' | 'inactive';
  isFree: boolean;
  expiryDate: string;
  purchaseDate: string;
  lastUpdated: string;
  notes?: string;
  paymentReference?: string;
}

export interface CreditSummary {
  totalCredits: number;
  totalValue: number;
  canAcceptBookings: boolean;
  creditTransactionCount: number;
}

export interface RiderCreditsResponse {
  rider: RiderInfo;
  summary: CreditSummary;
  transactions: CreditTransaction[];
}

export interface AddCreditsRequest {
  riderId: number;
  creditCount: number;
  value: number;
  transactionType?: 'purchase' | 'admin_grant' | 'promotion' | 'refund';
  notes?: string;
  adminId?: string;
  paymentReference?: string;
}

export interface AddCreditsResponse {
  riderId: number;
  creditsAdded: number;
  valueAdded: number;
  totalCredits: number;
  totalValue: number;
  transactionType: string;
  timestamp: string;
}

export interface DeductCreditsRequest {
  riderId: number;
  creditCount: number;
  reason?: string;
}

export interface DeductCreditsResponse {
  riderId: number;
  creditsDeducted: number;
  remainingCredits: number;
  reason?: string;
  timestamp: string;
}

export interface UpdateFreeTierRequest {
  riderId: number;
  isFree: boolean;
  notes?: string;
}

export interface UpdateFreeTierResponse {
  riderId: number;
  isFree: boolean;
  status: string;
}

class RiderCreditsService {
  private baseUrl = '/admin/rider-credits';

  async getRiderCredits(riderId: number) {
    try {
      const response = await apiClient.get<any>(
        `${this.baseUrl}/${riderId}`
      );
      return response.data?.data as RiderCreditsResponse;
    } catch (error) {
      console.error('Error fetching rider credits:', error);
      throw error;
    }
  }

  async addCredits(request: AddCreditsRequest) {
    try {
      const response = await apiClient.post<any>(
        `${this.baseUrl}/add`,
        request
      );
      return response.data?.data as AddCreditsResponse;
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  async deductCredits(request: DeductCreditsRequest) {
    try {
      const response = await apiClient.post<any>(
        `${this.baseUrl}/deduct`,
        request
      );
      return response.data?.data as DeductCreditsResponse;
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  async updateFreeTierStatus(request: UpdateFreeTierRequest) {
    try {
      const response = await apiClient.put<any>(
        `${this.baseUrl}/status`,
        request
      );
      return response.data?.data as UpdateFreeTierResponse;
    } catch (error) {
      console.error('Error updating free tier status:', error);
      throw error;
    }
  }
}

export default new RiderCreditsService();
