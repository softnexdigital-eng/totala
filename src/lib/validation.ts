export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateOTP(otp: string): boolean {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}
