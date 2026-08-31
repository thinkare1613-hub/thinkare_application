export function validateOtpCode(otp: string | null | undefined): string | null {
  if (!otp) {
    return 'OTP must be a 6-digit numeric code.';
  }

  if (!/^\d{6}$/.test(otp.trim())) {
    return 'OTP must be a 6-digit numeric code.';
  }

  return null;
}
