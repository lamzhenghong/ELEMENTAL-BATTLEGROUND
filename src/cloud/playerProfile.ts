import type { Database } from './database.types';

export interface PlayerProfile {
  userId: string;
  username: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProfileDataSource {
  fetch(userId: string): Promise<PlayerProfile | null>;
  isUsernameAvailable(username: string): Promise<boolean>;
}

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
  updatedAt: row.updated_at
});
