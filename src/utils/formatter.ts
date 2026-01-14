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
 */
export const formatDate = (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
 */
export const formatDistanceToNow = (date: Date | string, _options?: { addSuffix?: boolean }): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return d.toLocaleDateString();
};
