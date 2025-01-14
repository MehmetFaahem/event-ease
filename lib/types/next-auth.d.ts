import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface AuthenticatedRequest extends NextRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
} 