import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import type { AuthRequest } from '@/lib/middleware/withAuth';

async function handler(req: AuthRequest) {
  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '9');
      const search = searchParams.get('search') || '';

      await connectDB();

      const query = {
        ...(search && {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
          ],
        }),
      };

      const total = await EventModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const events = await EventModel.find(query)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return NextResponse.json({
        events,
        pagination: {
          total,
          pages: totalPages,
          page,
          limit,
        },
      });
    } catch (error) {
      console.error('Events fetch error:', error);
      return new NextResponse('Internal server error', { status: 500 });
    }
  }

  if (req.method === 'POST') {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const body = await req.json();
      await connectDB();

      const event = await EventModel.create({
        ...body,
        organizer: userId,
        currentAttendees: 0,
        attendees: [],
      });

      return NextResponse.json(event, { status: 201 });
    } catch (error) {
      console.error('Event creation error:', error);
      return new NextResponse('Internal server error', { status: 500 });
    }
  }

  return new NextResponse('Method not allowed', { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler); 