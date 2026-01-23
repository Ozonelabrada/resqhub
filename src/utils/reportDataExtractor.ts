/**
 * Type-safe helpers for report data extraction
 * Prevents type errors and ensures data consistency
 */

import type { LostFoundItem } from '@/services/reportsService';
import type { NewsFeedItem } from '@/types/personalHub';

export type ReportLike = LostFoundItem | NewsFeedItem | Record<string, unknown>;

export interface ExtractedReportData {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  contactInfo: string;
  rewardDetails: string | number;
  reportType: string;
}

/**
 * Safely extract report type value
 */
export const extractReportType = (report: ReportLike): string => {
  if (typeof report === 'object' && report !== null) {
    // Check for reportType first
    const reportObj = report as Record<string, unknown>;
    if (typeof reportObj.reportType === 'string') {
      return reportObj.reportType;
    }
    
    // Then check for type field
    if (typeof reportObj.type === 'string') {
      const typeValue = String(reportObj.type).toLowerCase();
      return typeValue.charAt(0).toUpperCase() + typeValue.slice(1);
    }
    
    // Finally check for status field
    if (typeof reportObj.status === 'string') {
      const statusValue = String(reportObj.status).toLowerCase();
      return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }
  }
  
  return 'Lost';
};

/**
 * Safely extract contact information from various formats
 */
export const extractContactInfo = (report: ReportLike): string => {
  if (typeof report !== 'object' || report === null) {
    return '';
  }

  const reportObj = report as Record<string, unknown>;
  const contactInfo = reportObj.contactInfo;

  // If contactInfo is a string, return as is
  if (typeof contactInfo === 'string') {
    return contactInfo;
  }

  // If contactInfo is an object, extract phone or name
  if (typeof contactInfo === 'object' && contactInfo !== null) {
    const contactObj = contactInfo as Record<string, unknown>;
    if (typeof contactObj.phone === 'string') {
      return contactObj.phone;
    }
    if (typeof contactObj.name === 'string') {
      return contactObj.name;
    }
  }

  return '';
};

/**
 * Safely extract report data without type assertions
 */
export const extractReportData = (report: ReportLike): ExtractedReportData => {
  if (typeof report !== 'object' || report === null) {
    return {
      title: '',
      description: '',
      categoryId: '',
      location: '',
      contactInfo: '',
      rewardDetails: '',
      reportType: 'Lost'
    };
  }

  const reportObj = report as Record<string, unknown>;

  return {
    title: typeof reportObj.title === 'string' ? reportObj.title : '',
    description: typeof reportObj.description === 'string' ? reportObj.description : '',
    categoryId: String(reportObj.categoryId || ''),
    location: typeof reportObj.location === 'string' ? reportObj.location : '',
    contactInfo: extractContactInfo(report),
    rewardDetails: extractRewardDescription(report),
    reportType: extractReportType(report)
  };
};

/**
 * Safely extract reward description
 */
export const extractRewardDescription = (report: ReportLike): string => {
  if (typeof report !== 'object' || report === null) {
    return '';
  }

  const reportObj = report as Record<string, unknown>;

  // Check for direct rewardDetails
  if (typeof reportObj.rewardDetails === 'string') {
    return reportObj.rewardDetails;
  }

  // Check for reward.description
  if (typeof reportObj.reward === 'object' && reportObj.reward !== null) {
    const rewardObj = reportObj.reward as Record<string, unknown>;
    if (typeof rewardObj.description === 'string') {
      return rewardObj.description;
    }
  }

  return '';
};

/**
 * Validate extracted data
 */
export const validateReportData = (data: ExtractedReportData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!data.categoryId) {
    errors.push('Category is required');
  }

  if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (data.location.trim().length < 2) {
    errors.push('Location is required');
  }

  if (data.contactInfo.trim().length < 5) {
    errors.push('Contact information is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
