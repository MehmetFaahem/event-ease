import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Pencil } from 'lucide-react';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RegisterEventButton } from '@/components/events/register-event-button';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { env } from '@/lib/config/env';
import { Types } from 'mongoose';
import Link from 'next/link';

async function getEvent(id: string) {
  await connectDB();
  const event = await EventModel.findById(id)
    .select('title description date location maxAttendees currentAttendees status attendees organizer')
    .lean();
  
  if (!event) {
    notFound();
  }

  return JSON.parse(JSON.stringify(event));
}

async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, env.JWT_SECRET) as { id: string };
    return decoded;
  } catch {
    return null;
  }
}

export default async function DashboardEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  const isPast = new Date(event.date) < new Date();
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === event.organizer;
  const isRegistered = currentUser?.id && event.attendees?.some(
    (attendeeId: string) => attendeeId === currentUser.id
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.date), 'PPP')}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={
              event.status === 'published'
                ? isPast
                  ? 'secondary'
                  : 'default'
                : 'destructive'
            }
          >
            {isPast ? 'Past' : event.status}
          </Badge>
          {isOwner && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/events/${event._id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.currentAttendees} / {event.maxAttendees} attendees
            </span>
          </div>
          <p className="text-muted-foreground">{event.description}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Registration Status</h2>
                <p className="text-sm text-muted-foreground">
                  {isRegistered ? 'You are registered for this event' : 'You are not registered for this event'}
                </p>
              </div>
              <Badge variant={isRegistered ? 'default' : 'secondary'}>
                {isRegistered ? 'Registered' : 'Not Registered'}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spots</span>
                <span className="font-medium">{event.maxAttendees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spots Remaining</span>
                <span className="font-medium">{event.maxAttendees - event.currentAttendees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Status</span>
                <span className="font-medium">
                  {event.currentAttendees >= event.maxAttendees ? 'Full' : 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        {!isOwner && (
          <RegisterEventButton
            eventId={event._id}
            isRegistered={isRegistered}
            isFull={event.currentAttendees >= event.maxAttendees}
            isPast={isPast}
          />
        )}
        {isOwner && <DeleteEventButton eventId={event._id} />}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  await connectDB();
  const events = await EventModel.find({}, '_id');
  
  return events.map((event) => ({
    id: event._id.toString(),
  }));
} 