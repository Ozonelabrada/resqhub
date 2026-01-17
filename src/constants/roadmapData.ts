/**
 * Shared 2026 Community Roadmap Data
 * Used across CommunityAnnouncements and CommunityEvents components
 */

export interface AnnualEvent {
  month: string;
  title: string;
  type: 'Celebration' | 'Mission' | 'Maintenance' | 'Security';
  dateRange: string;
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
 * Helper function to parse roadmap date ranges and get all matching dates
 * Handles formats like "Jan 5-10", "Feb 10", "Apr 15-20"
 */
export const getRoadmapDatesForMonth = (month: number, year: number): { dates: string[], events: AnnualEvent[] } => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matchingDates: string[] = [];
  const matchingEvents: AnnualEvent[] = [];

  YEARLY_ROADMAP.forEach(item => {
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
  });

  return { dates: matchingDates, events: matchingEvents };
};

/**
 * Get the specific date range for a selected roadmap milestone
 * Returns the start and end dates as ISO strings
 */
export const getRoadmapDateRange = (item: AnnualEvent, year: number): { startDate: string; endDate: string; dates: string[] } => {
  const monthNum = new Date(`${item.month} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
  const dates: string[] = [];

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

  return { startDate: '', endDate: '', dates: [] };
};
