import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';

async function handler(
  req: AuthRequest,
  { params }: { params: { id: string } }
) {
  if (!['DELETE', 'PATCH'].includes(req.method!)) {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  try {
    const userId = req.user?.id;
    const eventId = params.id;

    await connectDB();

    const event = await EventModel.findOne({
      _id: eventId,
      organizer: userId,
    });

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    if (req.method === 'DELETE') {
      await event.deleteOne();
      return new NextResponse(null, { status: 204 });
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      
      // Update event fields
      Object.assign(event, body);
      await event.save();

      return NextResponse.json(event);
    }
  } catch (error) {
    console.error('Event operation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const DELETE = withAuth(handler);
export const PATCH = withAuth(handler); 