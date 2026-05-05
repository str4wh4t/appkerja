import { registerAs } from '@nestjs/config';

/** Path HTTP untuk endpoint GraphQL (mis. `/graphql` atau `/api/v1/graphql`). */
export function normalizeGraphqlPath(raw: string | undefined): string {
  const trimmed = (raw ?? '/graphql').trim();
  const path = trimmed === '' ? '/graphql' : trimmed;
  return path.startsWith('/') ? path : `/${path}`;
}

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  graphqlPath: normalizeGraphqlPath(process.env.GRAPHQL_PATH),
  // Default password untuk user baru
  userPasswordDefault: process.env.USER_PASSWORD_DEFAULT || 'ChangeMe123!',
  defaultTenantCode: process.env.DEFAULT_TENANT_CODE || 'default',
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Access token: pendek untuk security
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'your-refresh-secret-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d', // Refresh token: panjang untuk UX
  },
  // Google OAuth2 Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    stateSecret:
      process.env.GOOGLE_STATE_SECRET ||
      process.env.JWT_SECRET ||
      'google-state-secret',
    stateExpiresIn: process.env.GOOGLE_STATE_EXPIRES_IN || '10m',
    loginCodeExpiresInMs: parseInt(
      process.env.GOOGLE_LOGIN_CODE_EXPIRES_IN_MS || '60000',
      10,
    ),
  },
  // Rate Limiting Configuration
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: process.env.RATE_LIMIT_WINDOW_MS || '60000', // 1 minute in ms
  },
  // Redis (optional: untuk rate limiting shared + cache permission/config)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'nestapi:',
    cacheTtl: parseInt(process.env.REDIS_CACHE_TTL_MS || '300000', 10), // 5 min default
  },
}));
