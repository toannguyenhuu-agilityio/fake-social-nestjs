export const COOKIE_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

export const COOKIE_MAX_AGE = {
  ACCESS: 15 * 60 * 1000, // 15 minutes
  REFRESH: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const COOKIE_SECURE = process.env.NODE_ENV === 'production';

export const COOKIE_HTTP_ONLY = true;

export const COOKIE_SAME_SITE = 'lax';
