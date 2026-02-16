import {
  convertPHTimeToDeviceTime,
  formatBackendDateToLocal,
  formatBackendDateTimeToLocal,
  formatBackendTimeToLocal,
  formatBackendDateTimeAgo,
  formatBackendDateRange as formatBackendDateRangeUtil,
  getTimeDifferenceFromNow
} from './timezone';

/**
 * Category style definitions for consistent styling across components
 */
export interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
}

/**
 * Get consistent category styling based on category name
 * Supports: community, security, safety, events, infrastructure, social
 */
export const getCategoryStyles = (category: string): CategoryStyle => {
  const normalizedCategory = (category || '').toLowerCase().trim();
  
  switch (normalizedCategory) {
    case 'community': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
    case 'security': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
    case 'safety': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
    case 'events': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    case 'infrastructure': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
    case 'social': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
  }
};

/**
 * Format a number as Philippine Peso (PHP)
 */
export const formatCurrencyPHP = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

/**
 * Format a date string or Date object to a readable format
 * Handles backend dates (assumed to be PH time) and converts to device timezone
 */
export const formatDate = (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return '';
  return formatBackendDateToLocal(date, options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date range with start and end dates
 * Handles backend dates (assumed to be PH time) and converts to device timezone
 * Returns display format and status flags (isActive, isUpcoming)
 */
export interface DateRangeFormat {
  display: string;
  isActive: boolean;
  isUpcoming: boolean;
  isPast?: boolean;
}

export const formatDateRange = (startDate: string, endDate: string): DateRangeFormat => {
  const result = formatBackendDateRangeUtil(startDate, endDate);
  return {
    display: result.display,
    isActive: result.isActive,
    isUpcoming: result.isUpcoming,
    isPast: result.isPast
  };
};

/**
 * Format a number as a compact string (e.g., 1.2k)
 */
export const formatNumberCompact = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

/**
 * Simple time ago formatter
 * Handles backend dates (assumed to be PH time) and converts to device timezone
 */
export const formatDistanceToNow = (date: Date | string, _options?: { addSuffix?: boolean }): string => {
  if (!date) return '';
  return formatBackendDateTimeAgo(date);
};

// Roadmap Data Types and Formatters
export interface AnnualEvent {
  id?: number;
  month?: string;
  title: string;
  description?: string;
  type?: 'Celebration' | 'Mission' | 'Maintenance' | 'Security';
  category?: string;
  dateRange?: string;
  fromDate?: string; // ISO 8601 format from backend
  toDate?: string; // ISO 8601 format from backend
  time?: string;
  location?: string;
  communityId?: number;
  createdAt?: string;
}

export const YEARLY_ROADMAP: AnnualEvent[] = [
  { month: 'January', title: 'New Year Cleanup Drive', type: 'Mission', dateRange: 'Jan 5-10' },
  { month: 'February', title: 'Neighborhood Watch Seminar', type: 'Security', dateRange: 'Feb 10-12' },
  { month: 'April', title: 'Summer Youth Sports League', type: 'Celebration', dateRange: 'Apr 15-20' },
  { month: 'June', title: 'Drainage Systems Audit', type: 'Maintenance', dateRange: 'Jun 5-8' },
  { month: 'October', title: 'Community Fiesta 2026', type: 'Celebration', dateRange: 'Oct 20-25' },
  { month: 'December', title: 'Annual General Assembly', type: 'Mission', dateRange: 'Dec 15-17' },
];

/**
 * Helper function to parse roadmap/calendar date ranges and get all matching dates
 * Supports both old hardcoded format (month + dateRange) and new backend format (fromDate/toDate)
 * If calendarData is provided, uses that instead of YEARLY_ROADMAP
 */
export const getRoadmapDatesForMonth = (month: number, year: number, calendarData?: AnnualEvent[]): { dates: string[], events: AnnualEvent[] } => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matchingDates: string[] = [];
  const matchingEvents: AnnualEvent[] = [];
  
  // Use provided calendar data or fall back to hardcoded YEARLY_ROADMAP
  const roadmapEvents = calendarData || YEARLY_ROADMAP;

  roadmapEvents.forEach(item => {
    // Handle backend format with fromDate/toDate
    if (item.fromDate) {
      const fromDate = new Date(item.fromDate);
      const toDate = new Date(item.toDate || item.fromDate);
      
      // Check if event falls within the current month
      if (fromDate.getMonth() === month && fromDate.getFullYear() === year) {
        const startDay = fromDate.getDate();
        const endDay = toDate.getMonth() === month ? toDate.getDate() : daysInMonth;
        
        for (let d = startDay; d <= endDay && d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          matchingDates.push(dateStr);
        }
        matchingEvents.push(item);
      }
    } 
    // Handle old format with month and dateRange
    else if (item.month && item.dateRange) {
      const monthNum = new Date(`${item.month} 1, ${year}`).getMonth();
      if (monthNum !== month) return;

      // Parse date ranges (e.g., "Jan 5-10", "Feb 10", "Apr 15-20")
      const dateMatch = item.dateRange.match(/(\d+)(?:-|–)(\d+)?/);
      if (dateMatch) {
        const startDay = parseInt(dateMatch[1]);
        const endDay = dateMatch[2] ? parseInt(dateMatch[2]) : startDay;
        
        for (let d = startDay; d <= endDay && d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          matchingDates.push(dateStr);
        }
      }
      matchingEvents.push(item);
    }
  });

  return { dates: matchingDates, events: matchingEvents };
};

/**
 * Get the specific date range for a selected roadmap milestone
 * Returns the start and end dates as ISO strings
 * Handles both new format (fromDate/toDate) and old format (month/dateRange)
 */
export const getRoadmapDateRange = (item: AnnualEvent, year: number): { startDate: string; endDate: string; dates: string[] } => {
  const dates: string[] = [];

  // Handle new format with fromDate/toDate
  if (item.fromDate && item.toDate) {
    const fromDate = new Date(item.fromDate);
    const toDate = new Date(item.toDate);
    
    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      const startDate = fromDate.toISOString().split('T')[0];
      const endDate = toDate.toISOString().split('T')[0];
      
      // Generate all dates in the range
      let currentDate = new Date(fromDate);
      while (currentDate <= toDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { startDate, endDate, dates };
    }
  }

  // Handle old format with month and dateRange
  if (item.month && item.dateRange) {
    try {
      const monthNum = new Date(`${item.month} 1, ${year}`).getMonth();
      const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
      
      // Parse date range
      const dateMatch = item.dateRange.match(/(\d+)(?:-|–)(\d+)?/);
      if (dateMatch) {
        const startDay = parseInt(dateMatch[1]);
        const endDay = dateMatch[2] ? parseInt(dateMatch[2]) : startDay;
        
        const startDate = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(Math.min(endDay, daysInMonth)).padStart(2, '0')}`;
        
        // Generate all dates in range
        for (let d = startDay; d <= Math.min(endDay, daysInMonth); d++) {
          const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          dates.push(dateStr);
        }
        
        return { startDate, endDate, dates };
      }
    } catch (err) {
      console.error('Error parsing old format dateRange:', err);
    }
  }

  return { startDate: '', endDate: '', dates: [] };
};
