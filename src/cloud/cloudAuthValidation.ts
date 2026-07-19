const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCloudCredentials = (
  email: string,
  password: string,
  passwordConfirmation?: string
) => {
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (passwordConfirmation !== undefined && password !== passwordConfirmation) return 'Passwords do not match.';
  return null;
};

export const formatCloudAccountError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('username_taken')) return 'That username is already taken.';
  if (message.includes('invalid_username')) {
    return 'Username can only use 3 to 20 letters, numbers, or underscores.';
  }
  if (message.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (message.includes('email not confirmed')) return 'Confirm your email before signing in.';
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'An account already exists for this email.';
  }
  if (message.includes('rate limit')) return 'Too many requests. Wait a moment and try again.';
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Cloud services are unreachable. Your local save is safe.';
  }
  return 'Cloud account request failed. Please try again.';
};
