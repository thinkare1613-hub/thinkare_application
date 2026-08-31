import { describe, expect, it } from 'vitest';
import { validateOtpCode } from './otpValidation';

describe('otp validation', () => {
  it('accepts a six-digit otp code', () => {
    expect(validateOtpCode('123456')).toBeNull();
  });

  it('rejects non-numeric otp values', () => {
    expect(validateOtpCode('12A456')).toBe('OTP must be a 6-digit numeric code.');
  });

  it('rejects short otp values', () => {
    expect(validateOtpCode('12345')).toBe('OTP must be a 6-digit numeric code.');
  });
});
