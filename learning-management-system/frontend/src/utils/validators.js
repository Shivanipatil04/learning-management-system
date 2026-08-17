const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  if (!PHONE_REGEX.test(phone)) return "Enter a valid 10-digit phone number";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character";
  }
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return null;
};

export const runValidators = (checks) => {
  for (const [value, validatorFn] of checks) {
    const error = validatorFn(value);
    if (error) return error;
  }
  return null;
};

export const validateSignupForm = ({ name, email, phone, password }) =>
  runValidators([
    [name, validateName],
    [email, validateEmail],
    [phone, validatePhone],
    [password, validatePassword],
  ]);

export const validateLoginForm = ({ email, password }) =>
  runValidators([
    [email, validateEmail],
    [password, (val) => (!val ? "Password is required" : null)],
  ]);