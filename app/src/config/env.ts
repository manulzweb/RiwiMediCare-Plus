// app/src/config/env.ts

import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const envConfig = {
  PORT: Number(process.env.APP_PORT ?? 3000),

  NODE_ENV: process.env.NODE_ENV ?? 'development',

  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',').filter(Boolean) ?? [],

  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  DB: {
    HOST: process.env.POSTGRES_HOST ?? process.env.DB_CONTAINER_NAME ?? 'db',
    PORT: Number(process.env.POSTGRES_PORT ?? 5432),
    USER: required('POSTGRES_USER'),
    PASSWORD: required('POSTGRES_PASSWORD'),
    NAME: required('POSTGRES_DB'),
  },

  JWT: {
    ISSUER: process.env.JWT_ISSUER ?? 'express-typescript-auth',
    AUDIENCE: process.env.JWT_AUDIENCE ?? 'auth-client',
    ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
    REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  BCRYPT: {
    ROUNDS: Number(process.env.BCRYPT_ROUNDS ?? 12),
  },

  RATE_LIMIT: {
    WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
    MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  },

  REGISTER: {
    WINDOW_MS: Number(process.env.REGISTER_LIMIT_WINDOW_MS ?? 900000),
    MAX_REQUESTS: Number(process.env.REGISTER_LIMIT_MAX_REQUESTS ?? 10),
    MESSAGE:
      process.env.REGISTER_LIMIT_MESSAGE ??
      'Too many registration requests. Please try again later.',
  },
};
