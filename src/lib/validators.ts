/**
 * Zod-based validation schemas for secure form handling
 * Ensures all user input is validated before API submission
 * Prevents: XSS, injection attacks, data type mismatches
 */

import { z } from 'zod';

// Base validation rules
const NAME_REGEX = /^[a-zA-Z\s'-]{2,100}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

// Message constraints
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 5;
const MAX_MESSAGE_LENGTH = 10000;

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Email format is invalid'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const SignUpSchema = SignInSchema.extend({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(NAME_REGEX, 'Full name contains invalid characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, hyphens, and underscores'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(NAME_REGEX, 'Name contains invalid characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Email format is invalid'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(MIN_MESSAGE_LENGTH, `Message must be at least ${MIN_MESSAGE_LENGTH} characters`)
    .max(MAX_MESSAGE_LENGTH, `Message must be less than ${MAX_MESSAGE_LENGTH} characters`),
});

export const ReportFormSchema = z.object({
  categoryId: z
    .string()
    .min(1, 'Category is required'),
  title: z
    .string()
    .min(MIN_TITLE_LENGTH, `Title must be at least ${MIN_TITLE_LENGTH} characters`)
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z
    .string()
    .min(MIN_DESCRIPTION_LENGTH, `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`)
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must be less than 200 characters'),
  reportType: z
    .enum(['lost', 'found', 'news', 'discussion', 'announcement'])
    .default('lost'),
  rewardAmount: z
    .number()
    .int('Reward amount must be an integer')
    .nonnegative('Reward amount cannot be negative')
    .max(999999, 'Reward amount is too large')
    .default(0),
  rewardDetails: z
    .string()
    .max(500, 'Reward details must be less than 500 characters')
    .optional()
    .default(''),
  contactInfo: z
    .string()
    .min(5, 'Contact information must be at least 5 characters')
    .max(200, 'Contact information must be less than 200 characters'),
});

export const LocationSuggestionSchema = z.object({
  id: z.string().min(1, 'Location ID is required'),
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.string().optional(),
});

// Type inference from schemas
export type SignInFormData = z.infer<typeof SignInSchema>;
export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type ReportFormData = z.infer<typeof ReportFormSchema>;
export type LocationSuggestion = z.infer<typeof LocationSuggestionSchema>;

/**
 * Validation result type
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
};

/**
 * Safe validation wrapper
 */
export const validateFormData = <T,>(
  schema: z.ZodSchema,
  data: unknown,
): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};
