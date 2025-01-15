import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/lib/types/next-auth';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { withAuth } from '@/lib/middleware/withAuth';
import { withValidation } from '@/lib/middleware/withValidation';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string()
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: 'Date cannot be in the past',
    }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  maxAttendees: z.number().int().min(1).max(1000),
  status: z.enum(['draft', 'published']).default('published'),
});

async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query = search
      ? {
          status: 'published',
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : { status: 'published' };

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('organizer', 'name email'),
      EventModel.countDocuments(query),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function handler(
  req: AuthenticatedRequest & { validatedBody: z.infer<typeof createEventSchema> }
) {
  try {
    const userId = req.user?.id;
    const eventData = req.validatedBody;

    await connectDB();

    const event = await EventModel.create({
      ...eventData,
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

export const POST = withAuth(withValidation(createEventSchema, handler));
export { GET }; 