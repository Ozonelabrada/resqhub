export type ServiceType = 'rider' | 'seller' | 'personal-services' | 'event';
export type TabType = 'management' | 'requests' | 'history';

export interface UserRecord {
  id: string;
  name?: string;
  email: string;
  credits: number;
  isActive?: boolean;
  isExempted?: boolean;
  accessType?: string; // 'free' | 'premium' | subscription tier
}

export interface CreditRequest {
  id: string;
  userId: string;
  userName: string;
  requestedAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CreditHistory {
  id: string;
  userId: string;
  userName: string;
  actionType: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface ModalContext {
  userId: string;
  userName: string;
  currentCredits: number;
}

export interface Notification {
  type: 'success' | 'error';
  message: string;
}

export interface SubscriptionCreditPageProps {
  hideHeader?: boolean;
  serviceType?: ServiceType;
}
