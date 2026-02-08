// Match status types
export type MatchStatus = 
  | 'confirmed'           // Initial match created
  | 'pending_handover'    // Match verified, waiting for handover confirmation
  | 'resolved'            // Both parties confirmed handover
  | 'dismissed'           // Match rejected by one party
  | 'expired';            // 48-hour window expired without confirmation

export interface ReportMatch {
  id: number;
  sourceReportId: number;
  targetReportId: number;
  status: MatchStatus;
  sourceReport?: any;
  targetReport?: any;
  actedByUser?: any;
  createdAt?: string;
  confirmedAt?: string | null;
  handoverConfirmedAt?: string | null;
  expiresAt?: string | null;
  sourceUserHandoverConfirmed?: boolean;
  targetUserHandoverConfirmed?: boolean;
}

export interface HandoverConfirmationPayload {
  matchId: number;
  status: 'pending_handover' | 'resolved' | 'expired';
  handoverConfirmedBy?: 'source' | 'target';
  timestamp?: string;
}

export interface MatchExpirationData {
  matchId: number;
  createdAt: string;
  expiresAt: string;
  timeRemaining: number; // milliseconds
  isExpired: boolean;
  hoursRemaining: number;
}
