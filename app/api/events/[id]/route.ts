import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';

export const dynamic = 'force-dynamic';

async function handler(
  req: AuthRequest,
  context: { params: Record<string, string> }
) {
  if (req.method !== 'GET') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  try {
    await connectDB();

    const event = await EventModel.findById(context.params.id);
    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const GET = withAuth(handler); 