/**
 * Timezone Utility - Ensures backend times (PH time) are properly converted to device timezone
 * 
 * Backend returns all times in Philippine Time (UTC+8)
 * This utility converts them to device's local timezone automatically
 */

/**
 * Philippine timezone offset (UTC+8)
 */
const PH_TIMEZONE_OFFSET = 8; // UTC+8

/**
 * Convert a backend datetime string (assumed to be PH time) to a Date object
 * accounting for the device's timezone
 * 
 * @param backendDateString - ISO 8601 string from backend (treated as PH time)
 * @returns Date object adjusted for device timezone
 */
export const convertPHTimeToDeviceTime = (backendDateString: string | Date | undefined): Date => {
  if (!backendDateString) return new Date();
  
  const dateObj = typeof backendDateString === 'string' 
    ? new Date(backendDateString) 
    : backendDateString;
  
  // Get device timezone offset in hours (negative for west, positive for east)
  const deviceOffset = -dateObj.getTimezoneOffset() / 60;
  
  // Calculate the difference between PH timezone and device timezone
  const timezoneOffset = deviceOffset - PH_TIMEZONE_OFFSET;
  
  // Adjust the date by the timezone difference in milliseconds
  const adjustedTime = dateObj.getTime() + (timezoneOffset * 60 * 60 * 1000);
  
  return new Date(adjustedTime);
};

/**
 * Format a backend datetime to display local time of device
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in device's local timezone
 */
export const formatBackendDateToLocal = (
  backendDateString: string | Date | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!backendDateString) return '';
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  
  return deviceDate.toLocaleDateString('en-US', options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a backend datetime to display local time of device (with time)
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted datetime string in device's local timezone
 */
export const formatBackendDateTimeToLocal = (
  backendDateString: string | Date | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!backendDateString) return '';
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  
  return deviceDate.toLocaleString('en-US', options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Format backend time to display local time of device (time only)
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string in device's local timezone
 */
export const formatBackendTimeToLocal = (
  backendDateString: string | Date | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!backendDateString) return '';
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  
  return deviceDate.toLocaleTimeString('en-US', options || {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get time difference in seconds between now and a backend datetime
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @returns Difference in seconds (negative if future, positive if past)
 */
export const getTimeDifferenceFromNow = (backendDateString: string | Date | undefined): number => {
  if (!backendDateString) return 0;
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  const now = new Date();
  
  return Math.floor((now.getTime() - deviceDate.getTime()) / 1000);
};

/**
 * Format a backend datetime as "time ago" (e.g., "2 hours ago")
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @returns Human-readable time difference
 */
export const formatBackendDateTimeAgo = (backendDateString: string | Date | undefined): string => {
  if (!backendDateString) return '';
  
  const diffInSeconds = getTimeDifferenceFromNow(backendDateString);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  return deviceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

/**
 * Get the device's current timezone name
 * 
 * @returns Timezone name (e.g., "America/New_York", "Asia/Manila")
 */
export const getDeviceTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get the device's timezone offset from UTC in hours
 * 
 * @returns Offset in hours (e.g., +8 for PH, -5 for EST)
 */
export const getDeviceTimezoneOffset = (): number => {
  const now = new Date();
  return -now.getTimezoneOffset() / 60;
};

/**
 * Check if a backend datetime is in the past
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @returns true if the datetime is in the past, false otherwise
 */
export const isBackendDateInPast = (backendDateString: string | Date | undefined): boolean => {
  if (!backendDateString) return false;
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  return deviceDate < new Date();
};

/**
 * Check if a backend datetime is in the future
 * 
 * @param backendDateString - ISO 8601 string from backend
 * @returns true if the datetime is in the future, false otherwise
 */
export const isBackendDateInFuture = (backendDateString: string | Date | undefined): boolean => {
  if (!backendDateString) return false;
  
  const deviceDate = convertPHTimeToDeviceTime(backendDateString);
  return deviceDate > new Date();
};

/**
 * Compare two backend datetimes
 * 
 * @param date1 - First backend datetime
 * @param date2 - Second backend datetime
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareBackendDates = (
  date1: string | Date | undefined,
  date2: string | Date | undefined
): number => {
  if (!date1 || !date2) return 0;
  
  const d1 = convertPHTimeToDeviceTime(date1);
  const d2 = convertPHTimeToDeviceTime(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Format a date range with backend datetimes
 * 
 * @param startDate - Backend start datetime
 * @param endDate - Backend end datetime
 * @returns Object with formatted display and status flags
 */
export const formatBackendDateRange = (
  startDate: string | Date | undefined,
  endDate: string | Date | undefined
): { display: string; isActive: boolean; isUpcoming: boolean; isPast: boolean } => {
  if (!startDate || !endDate) {
    return {
      display: '',
      isActive: false,
      isUpcoming: false,
      isPast: false
    };
  }
  
  const start = convertPHTimeToDeviceTime(startDate);
  const end = convertPHTimeToDeviceTime(endDate);
  const now = new Date();
  
  const isActive = now >= start && now <= end;
  const isUpcoming = now < start;
  const isPast = now > end;
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return {
    display: `${formatDate(start)} - ${formatDate(end)}`,
    isActive,
    isUpcoming,
    isPast
  };
};
