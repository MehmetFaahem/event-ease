'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';

async function getEvents(searchParams: { page?: string; search?: string }) {
  await connectDB();

  const page = parseInt(searchParams.page || '1');
  const limit = 9;
  const search = searchParams.search || '';

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
      .populate('organizer', 'name'),
    EventModel.countDocuments(query),
  ]);

  return {
    events,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

export async function EventList({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const { events, pagination } = await getEvents(searchParams);

  if (events.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">No events found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.date), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.currentAttendees} / {event.maxAttendees} attendees
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/events/${event._id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 