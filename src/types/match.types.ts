// Match status types - must align with backend allowed values
export type MatchStatus = 
  | 'suggested'           // Initial match proposal
  | 'confirmed'           // Match confirmed by user - starts 48-hour handover window
  | 'dismissed'           // Match rejected by user
  | 'expired'             // 48-hour handover window expired
  | 'resolved';           // Match completed and resolved

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
  // Ownership verification tracking
  ownershipVerificationAttempts?: Array<{
    attemptNumber: number;
    questionId: string;
    answeredAt: string;
    isCorrect: boolean;
  }>;
  verificationFailedCount?: number; // 0-3
  verificationDismissedAt?: string | null;
  isOwnershipVerified?: boolean;
}

export interface HandoverConfirmationPayload {
  matchId: number;
  status: 'confirmed' | 'resolved' | 'expired';
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
