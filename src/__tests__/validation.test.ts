import { validateEmail } from '../utils/validation';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@.com')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('should return false for empty email', () => {
    expect(validateEmail('')).toBe(false);
  });
});
