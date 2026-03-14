/**
 * Date and Time Formatters
 */

/**
 * Convert a date string (YYYY-MM-DD) to UTC ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param dateStr - Date string in format YYYY-MM-DD
 * @param setEndOfDay - If true, sets time to 23:59:59.999 UTC; otherwise sets to 00:00:00 UTC
 * @returns ISO 8601 datetime string in UTC format
 * @example
 * convertToUtcIso('2024-03-14') // '2024-03-14T00:00:00.000Z'
 * convertToUtcIso('2024-03-14', true) // '2024-03-14T23:59:59.999Z'
 */
export const convertToUtcIso = (dateStr: string, setEndOfDay: boolean = false): string => {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (setEndOfDay) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date.toISOString();
};

/**
 * Format a datetime string to a readable date format
 * @param dateStr - ISO datetime string
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 * @example
 * formatDate('2024-03-14T10:30:00Z') // '3/14/2024'
 */
export const formatDate = (dateStr: string, locale: string = 'en-US'): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale);
};

/**
 * Format a datetime string to a readable datetime format
 * @param dateStr - ISO datetime string
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted datetime string
 * @example
 * formatDateTime('2024-03-14T10:30:00Z') // '3/14/2024, 10:30:00 AM'
 */
export const formatDateTime = (dateStr: string, locale: string = 'en-US'): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(locale);
};

/**
 * Format a datetime string to a short date format
 * @param dateStr - ISO datetime string
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted short date string
 * @example
 * formatShortDate('2024-03-14T10:30:00Z') // 'Mar 14'
 */
export const formatShortDate = (dateStr: string, locale: string = 'en-US'): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

/**
 * Format a number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'PHP')
 * @param locale - Locale for formatting (default: 'en-PH')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // '₱1,234.56'
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'PHP',
  locale: string = 'en-PH'
): string => {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string
 * @example
 * formatNumber(1234567) // '1,234,567'
 */
export const formatNumber = (num: number, locale: string = 'en-US'): string => {
  if (typeof num !== 'number') return '';
  return new Intl.NumberFormat(locale).format(num);
};
