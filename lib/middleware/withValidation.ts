import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuthRequest } from './withAuth';

export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (req: AuthRequest & { validatedBody: z.infer<T> }, context: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: AuthRequest, context: { params: Record<string, string> }) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return handler({ ...req, validatedBody: validatedData }, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({
          error: 'Validation failed',
          details: error.errors,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new NextResponse('Internal server error', { status: 500 });
    }
  };
} 