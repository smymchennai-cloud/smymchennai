// Phone number validation (10 digits, not starting with 0)
export const validatePhone = (value) => {
  if (!value) return '';
  if (!/^\d{10}$/.test(value)) return 'Must be exactly 10 digits';
  if (value.startsWith('0')) return 'Cannot start with 0';
  return '';
};

// Check if phone is valid (returns boolean)
export const isValidMobile = (mobile) => {
  return /^[1-9][0-9]{9}$/.test(mobile);
};

// Email validation
export const validateEmail = (value) => {
  if (!value) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Please enter a valid email address';
  return '';
};

// Check if email is valid (returns boolean)
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get max date for 18+ years (person must be at least 18)
export const getMaxDobFor18Plus = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
};

// Get min date for max 41 years (person cannot be older than 41)
export const getMinDobFor41Max = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 41);
  return date.toISOString().split('T')[0];
};

// Validate DOB is between 18 and 41 years
export const validateDobAge18 = (value) => {
  if (!value) return '';
  const dob = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  
  if (actualAge < 18) return 'Must be at least 18 years old';
  if (actualAge > 41) return 'Maximum age allowed is 41 years';
  return '';
};

// Validate date is not in the future
export const validateNotFutureDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return 'Date cannot be in the future';
  return '';
};
