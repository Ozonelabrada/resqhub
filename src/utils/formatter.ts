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
