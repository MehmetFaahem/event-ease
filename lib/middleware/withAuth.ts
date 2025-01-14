import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { env } from '@/lib/config/env';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

type Handler = (
  req: AuthRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: Handler) {
  return async (req: AuthRequest, context: { params: Record<string, string> }) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const decoded = verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = decoded;

      return handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new NextResponse('Invalid authentication token', { status: 401 });
    }
  };
} 