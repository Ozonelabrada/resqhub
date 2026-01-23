/**
 * API Response Type Definitions
 * 
 * Provides strongly-typed interfaces for all API response structures
 * to eliminate 'any' type usage in service layers
 */

import type { Category } from './category';
import type { Community, CommunityMember, CommunityPost } from './community';
import type { Report, PaginatedResponse } from '../api/types';
import type { NewsFeedItem, UserProfile } from './personalHub';
import type { LostFoundItem } from '../services/reportsService';

/**
 * Base API Error Response Structure
 * Replaces untyped 'errors: any' in BaseApiResponse
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors: ApiErrorDetail[];
  succeeded: false;
}

/**
 * Successful API Response Structure
 */
export interface ApiSuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  succeeded: true;
  errors: [];
}

/**
 * Paginated Response Structure (service-specific)
 */
export interface PaginatedItems<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  loadMore?: boolean;
}

/**
 * Category Service Response Types
 */
export interface CategoryListResponse extends ApiSuccessResponse<PaginatedItems<Category>> {
  data: PaginatedItems<Category>;
}

export interface CategoryDetailResponse extends ApiSuccessResponse<Category> {
  data: Category;
}

/**
 * Community Service Response Types
 */
export interface CommunityListResponse extends ApiSuccessResponse<PaginatedItems<Community>> {
  data: PaginatedItems<Community>;
}

export interface CommunityDetailResponse extends ApiSuccessResponse<Community> {
  data: Community;
}

export interface CommunityMembersResponse extends ApiSuccessResponse<{
  members: CommunityMember[];
  page: number;
  pageSize: number;
  total: number;
}> {
  data: {
    members: CommunityMember[];
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface CommunityPostsResponse extends ApiSuccessResponse<PaginatedResponse<CommunityPost>> {
  data: PaginatedResponse<CommunityPost>;
}

/**
 * Report Service Response Types
 */
export interface ReportDetailResponse extends ApiSuccessResponse<Report> {
  data: Report;
}

export interface ReportListResponse extends ApiSuccessResponse<PaginatedResponse<Report>> {
  data: PaginatedResponse<Report>;
}

export interface NewsFeedResponse extends ApiSuccessResponse<PaginatedResponse<NewsFeedItem>> {
  data: PaginatedResponse<NewsFeedItem>;
}

export interface UserReportsResponse extends ApiSuccessResponse<{
  reports: LostFoundItem[];
  hasMore: boolean;
  page: number;
}> {
  data: {
    reports: LostFoundItem[];
    hasMore: boolean;
    page: number;
  };
}

/**
 * User Service Response Types
 */
export interface UserProfileResponse extends ApiSuccessResponse<UserProfile> {
  data: UserProfile;
}

export interface UserContactsResponse extends ApiSuccessResponse<UserProfile[]> {
  data: UserProfile[];
}

export interface UserSearchResponse extends ApiSuccessResponse<{
  users: UserProfile[];
  total: number;
}> {
  data: {
    users: UserProfile[];
    total: number;
  };
}

/**
 * Items Service Response Types
 */
export interface CreateReportResponse extends ApiSuccessResponse<{
  id: string | number;
  message: string;
}> {
  data: {
    id: string | number;
    message: string;
  };
}

export interface CreateItemDetailsResponse extends ApiSuccessResponse<{
  id: string | number;
  reportId: string | number;
  message: string;
}> {
  data: {
    id: string | number;
    reportId: string | number;
    message: string;
  };
}

/**
 * Contact Service Response Types
 */
export interface ContactSubmissionResponse extends ApiSuccessResponse<{
  ticketId: string;
  message: string;
}> {
  data: {
    ticketId: string;
    message: string;
  };
}

/**
 * Type Guard Functions
 */
export const isErrorResponse = (data: unknown): data is ApiErrorResponse => {
  const obj = data as Record<string, unknown>;
  return obj?.succeeded === false && Array.isArray(obj?.errors);
};

export const isSuccessResponse = <T,>(data: unknown): data is ApiSuccessResponse<T> => {
  const obj = data as Record<string, unknown>;
  return obj?.succeeded === true && 'data' in obj;
};

export const isPaginatedResponse = <T,>(data: unknown): data is PaginatedResponse<T> => {
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj?.items) &&
    typeof obj?.pageNumber === 'number' &&
    typeof obj?.pageSize === 'number' &&
    typeof obj?.totalCount === 'number' &&
    typeof obj?.totalPages === 'number'
  );
};
