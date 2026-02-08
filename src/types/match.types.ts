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

// Rejection reasons for match dismissal
export type RejectionReason = 
  | 'not_my_item'           // Item doesn't match
  | 'wrong_condition'       // Item condition different
  | 'already_found'         // Already found/recovered elsewhere
  | 'suspicious_behavior'   // Suspicious activity
  | 'wrong_location'        // Wrong location or area
  | 'incorrect_details'     // Details don't match
  | 'item_damaged'          // Item too damaged
  | 'other';                // Other reason

export interface MatchRejectionRecord {
  matchId: number;
  rejectedBy: 'source' | 'target';
  reason: RejectionReason;
  reasonDetails?: string;   // Optional detailed explanation
  rejectedAt: string;
  notifiedAt?: string;
}

export interface UserRejectionStats {
  userId: string;
  totalRejections: number;
  rejectionReasons: Record<RejectionReason, number>;
  lastRejectionAt?: string;
  isFlagged: boolean;       // True if 3+ rejections
  flaggedAt?: string;
  flagReason?: string;
}
