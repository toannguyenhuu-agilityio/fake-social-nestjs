export const JWT_SECRET = {
  ACCESS: process.env.JWT_SECRET,
  REFRESH: process.env.JWT_REFRESH_SECRET,
};

export const JWT_EXPIRES_IN = {
  ACCESS: '15m',
  REFRESH: '7d',
};
