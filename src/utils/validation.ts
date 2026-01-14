// Email validation with comprehensive checks
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Additional checks
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false; // RFC 5321 limit
  if (email.includes('..')) return false; // Consecutive dots not allowed

  return true;
};

// Enhanced password validation
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;

  // Minimum requirements
  if (password.length < 8) return false;

  // Check for at least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumbers;
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// Validate and sanitize text input
export const validateAndSanitizeText = (text: string, maxLength: number = 1000): string => {
  if (!text || typeof text !== 'string') return '';

  const sanitized = sanitizeInput(text);
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

// Validate phone number (basic international format)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;

  // Remove all non-digit characters except + and spaces
  const cleanPhone = phone.replace(/[^\d+\-\s()]/g, '');

  // Basic validation: should start with + or digit, minimum length
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(cleanPhone);
};

// Validate URL
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validate file upload (basic security check)
export const validateFileUpload = (file: File, allowedTypes: string[] = [], maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  if (!file) return { valid: false, error: 'No file provided' };

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  // Check file type if restrictions provided
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const fileName = file.name.toLowerCase();
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return { valid: false, error: 'File type not allowed for security reasons' };
  }

  return { valid: true };
};