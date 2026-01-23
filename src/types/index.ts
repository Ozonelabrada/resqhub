// Export all types - managing duplicates with explicit imports
export { BaseApiResponse, PaginatedResponse } from '../api/types'; // Export only non-conflicting types from api/types
export * from './personalHub'; // Contains UserProfile
export * from './auth';
export * from './statistics';
export * from './items'; // Contains Report interface
export * from './trending';
export * from './category';
export * from './community';
// Explicitly import to avoid conflicts with personalHub
export type {
  AdminOverview,
  AdminActivity,
  CommunitySummary,
  CommunityFeature,
  CommunityDetail,
  CommunityListParams,
  CommunityListResponse,
  Subscription,
  Payment,
  SubscriptionListParams,
  AdminReport,
  ReportSummary,
  ReportListParams,
  ReportListResponse,
  AdminAction,
  AdminActionResponse,
  AuditLogEntry,
  AdminStatistics,
  AdminSearchFilters,
  AdminSearchParams
} from './admin';
export type {
  ReportFormData,
  ContactFormData,
  SignInFormData,
  SignUpFormData,
  LocationSuggestion,
  FormErrors,
  ApiErrorResponse,
  ApiSuccessResponse
} from './forms';
export * from './events';
export * from './window';
export * from './responses';
export * from './hooks';
export { LostFoundItem } from '../services/reportsService';

