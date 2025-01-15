const requiredEnvVars = [
  'NEXT_PUBLIC_MONGODB_URI',
  'NEXT_PUBLIC_JWT_SECRET',
  'NEXT_PUBLIC_SOCKET_URL',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_NODE_ENV',
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(key: EnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  MONGODB_URI: getEnvVar('NEXT_PUBLIC_MONGODB_URI'),
  JWT_SECRET: getEnvVar('NEXT_PUBLIC_JWT_SECRET'),
  NEXT_PUBLIC_SOCKET_URL: getEnvVar('NEXT_PUBLIC_SOCKET_URL'),
  NEXT_PUBLIC_API_URL: getEnvVar('NEXT_PUBLIC_API_URL'),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const; 