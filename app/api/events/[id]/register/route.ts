import { NextResponse } from 'next/server';
import type { AuthRequest } from '@/lib/middleware/withAuth';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import { emitEventUpdate } from '@/lib/socket/server';

async function handler(
  req: AuthRequest,
  { params }: { params: { id: string } }
) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  try {
    const userId = req.user?.id;
    const eventId = params.id;

    await connectDB();

    const event = await EventModel.findById(eventId);
    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    if (event.currentAttendees >= event.maxAttendees) {
      return new NextResponse('Event is full', { status: 400 });
    }

    // Initialize arrays if they don't exist
    if (!event.attendees) {
      event.attendees = [];
    }
    if (!event.registrations) {
      event.registrations = [];
    }

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return new NextResponse('Already registered', { status: 400 });
    }

    // Add user to attendees and registrations
    event.attendees.push(userId);
    event.registrations.push({
      user: userId,
      registeredAt: new Date(),
    });
    event.currentAttendees += 1;
    
    await event.save();

    try {
      emitEventUpdate(eventId, {
        type: 'attendee-registered',
        data: {
          eventId,
          currentAttendees: event.currentAttendees,
          maxAttendees: event.maxAttendees,
        },
      });

      if (event.currentAttendees === event.maxAttendees) {
        emitEventUpdate(eventId, {
          type: 'event-full',
          data: { eventId },
        });
      }
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return NextResponse.json({
      message: 'Registration successful',
      currentAttendees: event.currentAttendees,
    });
  } catch (error) {
    console.error('Event registration error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const POST = withAuth(handler); 