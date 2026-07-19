import assert from 'node:assert/strict';
import { formatCloudAccountError, validateCloudCredentials } from './cloudAuthValidation';

assert.equal(validateCloudCredentials('bad-email', 'password123'), 'Enter a valid email address.');
assert.equal(validateCloudCredentials('player@example.com', 'short'), 'Password must be at least 8 characters.');
assert.equal(validateCloudCredentials('player@example.com', 'password123'), null);
assert.equal(
  validateCloudCredentials('player@example.com', 'password123', 'different123'),
  'Passwords do not match.'
);

assert.equal(formatCloudAccountError(new Error('Invalid login credentials')), 'Email or password is incorrect.');
assert.equal(formatCloudAccountError(new Error('Email not confirmed')), 'Confirm your email before signing in.');
assert.equal(formatCloudAccountError(new Error('User already registered')), 'An account already exists for this email.');
assert.equal(formatCloudAccountError(new Error('username_taken')), 'That username is already in use.');
assert.equal(formatCloudAccountError({ message: 'username_taken' }), 'That username is already in use.');
assert.equal(
  formatCloudAccountError({ message: 'username_change_cooldown', details: '2026-07-21 12:00:00+00' }),
  'You can change your username once every 24 hours.'
);
assert.equal(formatCloudAccountError({ message: 'username_unchanged' }), 'Choose a different username.');
assert.equal(
  formatCloudAccountError(new Error('invalid_username')),
  'Username can only use 3 to 20 letters, numbers, or underscores.'
);
assert.equal(formatCloudAccountError(new Error('Failed to fetch')), 'Cloud services are unreachable. Your local save is safe.');
assert.equal(formatCloudAccountError('anything else'), 'Cloud account request failed. Please try again.');

console.log('cloud auth validation rules ok');
