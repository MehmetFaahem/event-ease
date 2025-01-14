import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';

async function handler(req: AuthRequest) {
  if (req.method !== 'GET') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Get total events count
    const totalEvents = await EventModel.countDocuments({
      organizer: userId,
    });

    // Get active events (future events that are published)
    const activeEvents = await EventModel.countDocuments({
      organizer: userId,
      status: 'published',
      date: { $gte: new Date() },
    });

    // Get total attendees across all events
    const events = await EventModel.find({ organizer: userId });
    const totalAttendees = events.reduce(
      (sum, event) => sum + event.currentAttendees,
      0
    );

    // Calculate registration rate
    const totalCapacity = events.reduce(
      (sum, event) => sum + event.maxAttendees,
      0
    );
    const registrationRate = totalCapacity > 0
      ? Math.round((totalAttendees / totalCapacity) * 100)
      : 0;

    // Get recent events
    const recentEvents = await EventModel.find({ organizer: userId })
      .sort({ date: 1 })
      .limit(5)
      .select('title date location currentAttendees maxAttendees');

    return NextResponse.json({
      totalEvents,
      activeEvents,
      totalAttendees,
      registrationRate,
      recentEvents,
      overview: {
        daily: {
          events: totalEvents,
          attendees: totalAttendees,
          rate: registrationRate,
        },
        weekly: {
          events: totalEvents,
          attendees: totalAttendees,
          rate: registrationRate,
        },
        monthly: {
          events: totalEvents,
          attendees: totalAttendees,
          rate: registrationRate,
        },
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const GET = withAuth(handler); 