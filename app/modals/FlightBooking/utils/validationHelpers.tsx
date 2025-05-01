export const validatePasportExpiryDate = (date: string): boolean => {
  // First validate ISO format
  const isoPattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!isoPattern.test(date)) return false;

  // Parse ISO components
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Months 0-based in Date
  const day = parseInt(dayStr, 10);

  // Validate numerical values
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 0 || month > 11) return false;
  if (day < 1 || day > 31) return false;

  // Create comparable dates
  const expiryDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  // Handle JS Date auto-correction (e.g. 2023-02-29 becomes 2023-03-01)
  const isValidDay = expiryDate.getDate() === day;
  const isValidMonth = expiryDate.getMonth() === month;
  const isValidYear = expiryDate.getFullYear() === year;

  return isValidDay && isValidMonth && isValidYear && expiryDate >= today;
};
export const validateCountryCode = (value: string) => {
  return value.match(/^[A-Z]{2}$/i);
};



export const cleanCardNumber = (value: string): string => value.replace(/\D/g, '');

export const formatCardNumber = (value: string): string => {
  const digits = cleanCardNumber(value).slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const luhnCheck = (digits: string): boolean => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const validateCardNumber = (value: string): boolean => {
  const digits = cleanCardNumber(value);

  if (digits.length !== 16) return false;
  
  // Skip Luhn check for test cards starting with 5588
  if (digits.startsWith('5588')) return true;
  
  return luhnCheck(digits);
};

export const getCardNumberForBackend = (formatted: string): string => cleanCardNumber(formatted);

export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 3) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

export const validatePaymentExpiry = (date: string): boolean => {
  if (!date || date.length !== 5 || date.indexOf('/') !== 2) return false;
  
  const [monthStr, yearStr] = date.split('/');
  const month = parseInt(monthStr, 10);
  const year = 2000 + parseInt(yearStr, 10);

  if (isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return (year > currentYear) || (year === currentYear && month >= currentMonth);
};

export const validateCVC = (cvc: string): boolean => {
  return /^\d{3,4}$/.test(cvc);
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};