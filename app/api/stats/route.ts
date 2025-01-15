import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';

async function handler(req: AuthRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;

    const [
      totalEvents,
      activeEvents,
      totalAttendees,
      registrationStats
    ] = await Promise.all([
      EventModel.countDocuments({ organizer: userId }),
      EventModel.countDocuments({
        organizer: userId,
        status: 'published',
        date: { $gte: new Date() }
      }),
      EventModel.aggregate([
        { $match: { organizer: userId } },
        { $group: { _id: null, total: { $sum: '$currentAttendees' } } }
      ]),
      EventModel.aggregate([
        { $match: { organizer: userId } },
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: '$maxAttendees' },
            totalAttendees: { $sum: '$currentAttendees' }
          }
        }
      ])
    ]);

    const registrationRate = registrationStats.length > 0
      ? Math.round((registrationStats[0].totalAttendees / registrationStats[0].totalCapacity) * 100)
      : 0;

    return NextResponse.json({
      totalEvents,
      activeEvents,
      totalAttendees: totalAttendees[0]?.total || 0,
      registrationRate: `${registrationRate}%`
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const GET = withAuth(handler); 