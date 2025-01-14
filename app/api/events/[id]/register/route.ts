import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';
import { getSocketServer } from '@/lib/socket/server';

export const dynamic = 'force-dynamic';

async function handler(
  req: AuthRequest,
  context: { params: Record<string, string> }
) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Get event and check if it exists
    const event = await EventModel.findById(context.params.id);
    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return new NextResponse('Event is not available for registration', { status: 400 });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return new NextResponse('Event is full', { status: 400 });
    }

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return new NextResponse('Already registered', { status: 400 });
    }

    // Update event with new attendee
    const updatedEvent = await EventModel.findByIdAndUpdate(
      context.params.id,
      {
        $push: { attendees: userId },
        $inc: { currentAttendees: 1 },
      },
      { new: true }
    );

    // Emit socket event for real-time updates
    const io = getSocketServer();
    if (io) {
      io.to(`event:${context.params.id}`).emit(
        `event:${context.params.id}:update`,
        updatedEvent
      );
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const POST = withAuth(handler); 