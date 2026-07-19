import type { Database } from './database.types';

export interface PlayerProfile {
  userId: string;
  username: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
  usernameChangedAt: string | null;
}

export interface PlayerProfileDataSource {
  fetch(userId: string): Promise<PlayerProfile | null>;
  isUsernameAvailable(username: string): Promise<boolean>;
  changeUsername(username: string): Promise<PlayerProfile>;
}

export const USERNAME_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const normalizeUsername = (username: string) => username.trim();

export const validateUsername = (username: string) => {
  const normalized = normalizeUsername(username);
  if (normalized.length < 3 || normalized.length > 20) {
    return 'Username must be 3 to 20 characters.';
  }
  if (!/^[A-Za-z0-9_]+$/.test(normalized)) {
    return 'Username can only use letters, numbers, and underscores.';
  }
  return null;
};

export const mapPlayerProfileRow = (
  row: Database['public']['Tables']['player_profiles']['Row']
): PlayerProfile => ({
  userId: row.user_id,
  username: row.username,
  publicId: row.public_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  usernameChangedAt: row.username_changed_at
});

export const getUsernameChangeAvailableAt = (profile: PlayerProfile) => (
  profile.usernameChangedAt
    ? new Date(Date.parse(profile.usernameChangedAt) + USERNAME_CHANGE_COOLDOWN_MS)
    : null
);

export const getUsernameChangeRemainingMs = (profile: PlayerProfile, now = Date.now()) => {
  const availableAt = getUsernameChangeAvailableAt(profile);
  return availableAt ? Math.max(0, availableAt.getTime() - now) : 0;
};
