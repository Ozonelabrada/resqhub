// Mock data for subscription management
import { UserRecord, CreditRequest, CreditHistory } from '../types/subscription';

export type ServiceType = 'rider' | 'seller' | 'personal-services' | 'event';

export const generateMockData = (type: ServiceType): UserRecord[] => {
  const mockDataByType: Record<ServiceType, UserRecord[]> = {
    rider: [
      { id: 'r1', name: 'John Doe', email: 'john@example.com', credits: 150, isActive: true, isExempted: false },
      { id: 'r2', name: 'Jane Smith', email: 'jane@example.com', credits: 75, isActive: true, isExempted: true },
      { id: 'r3', name: 'Mike Johnson', email: 'mike@example.com', credits: 200, isActive: false, isExempted: false },
      { id: 'r4', name: 'Sarah Williams', email: 'sarah@example.com', credits: 120, isActive: true, isExempted: false },
      { id: 'r5', name: 'Robert Brown', email: 'robert@example.com', credits: 0, isActive: true, isExempted: false },
    ],
    seller: [
      { id: 's1', name: 'Tech Store Co', email: 'tech@store.com', credits: 500, isActive: true, isExempted: false },
      { id: 's2', name: 'Fashion Hub', email: 'fashion@hub.com', credits: 350, isActive: true, isExempted: false },
      { id: 's3', name: 'Home Decor Ltd', email: 'decor@home.com', credits: 200, isActive: false, isExempted: true },
      { id: 's4', name: 'Electronics Plus', email: 'electronics@plus.com', credits: 600, isActive: true, isExempted: false },
      { id: 's5', name: 'Beauty Shop', email: 'beauty@shop.com', credits: 250, isActive: true, isExempted: false },
    ],
    'personal-services': [
      { id: 'p1', name: 'John Plumber', email: 'plumbor@services.com', credits: 80, isActive: true, isExempted: false },
      { id: 'p2', name: 'Mary Electrician', email: 'electrician@services.com', credits: 120, isActive: true, isExempted: false },
      { id: 'p3', name: 'David Handyman', email: 'handyman@services.com', credits: 50, isActive: false, isExempted: false },
      { id: 'p4', name: 'Lisa Cleaner', email: 'cleaner@services.com', credits: 100, isActive: true, isExempted: true },
      { id: 'p5', name: 'Tom Mechanic', email: 'mechanic@services.com', credits: 150, isActive: true, isExempted: false },
    ],
    event: [
      { id: 'e1', name: 'Summer Festival 2025', email: 'summer@festival.com', credits: 1000, isActive: true, isExempted: false },
      { id: 'e2', name: 'Tech Conference', email: 'tech@conference.com', credits: 800, isActive: true, isExempted: false },
      { id: 'e3', name: 'Charity Gala', email: 'charity@gala.com', credits: 500, isActive: false, isExempted: false },
      { id: 'e4', name: 'Music Concert', email: 'music@concert.com', credits: 1200, isActive: true, isExempted: true },
      { id: 'e5', name: 'Sports Tournament', email: 'sports@tournament.com', credits: 600, isActive: true, isExempted: false },
    ],
  };
  return mockDataByType[type];
};

export const generateMockRequests = (): CreditRequest[] => [
  { id: 'req1', userId: 'r1', userName: 'John Doe', requestedAmount: 50, reason: 'Low balance', status: 'pending', createdAt: '2025-03-15' },
  { id: 'req2', userId: 's1', userName: 'Tech Store Co', requestedAmount: 200, reason: 'Promotional period', status: 'pending', createdAt: '2025-03-14' },
  { id: 'req3', userId: 'p2', userName: 'Mary Electrician', requestedAmount: 30, reason: 'Emergency work', status: 'approved', createdAt: '2025-03-10' },
];

export const generateMockHistory = (): CreditHistory[] => [
  { id: 'h1', userId: 'r1', userName: 'John Doe', actionType: 'grant', amount: 100, reason: 'Monthly allowance', timestamp: '2025-03-18' },
  { id: 'h2', userId: 's1', userName: 'Tech Store Co', actionType: 'deduct', amount: 50, reason: 'Policy violation', timestamp: '2025-03-17' },
  { id: 'h3', userId: 'p1', userName: 'John Plumber', actionType: 'grant', amount: 75, reason: 'Referral bonus', timestamp: '2025-03-16' },
  { id: 'h4', userId: 'r2', userName: 'Jane Smith', actionType: 'exemption_added', amount: 0, reason: 'Premium member', timestamp: '2025-03-15' },
  { id: 'h5', userId: 'e1', userName: 'Summer Festival 2025', actionType: 'grant', amount: 250, reason: 'Event bonus', timestamp: '2025-03-14' },
];
