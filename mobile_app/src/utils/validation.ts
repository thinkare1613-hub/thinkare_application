export function isValidPhone(phone: string) { return phone.replace(/\D/g, "").length >= 10; }
export function isValidOtp(otp: string) { return /^\d{6}$/.test(otp); }
