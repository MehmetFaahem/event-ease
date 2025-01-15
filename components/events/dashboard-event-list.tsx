import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Pencil } from 'lucide-react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { env } from '@/lib/config/env';
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
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { DeleteEventButton } from './delete-event-button';
import { cn } from '@/lib/utils';

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

async function getDashboardEvents() {
  await connectDB();
  const events = await EventModel.find()
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(events));
}

export async function DashboardEventList() {
  const events = await getDashboardEvents();
  const currentUser = await getCurrentUser();

  if (events.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">No events found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/events/create">Create your first event</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <DashboardEventCard 
          key={event._id} 
          event={event} 
          isOwner={currentUser?.id === event.organizer}
        />
      ))}
    </div>
  );
}

interface DashboardEventCardProps {
  event: any;
  isOwner: boolean;
}

function DashboardEventCard({ event, isOwner }: DashboardEventCardProps) {
  const isPast = new Date(event.date) < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.date), 'PPP')}
            </CardDescription>
          </div>
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
        </div>
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
      <CardFooter className={cn("grid gap-2", isOwner ? "grid-cols-3" : "grid-cols-1")}>
        <Button asChild variant="outline">
          <Link href={`/dashboard/events/${event._id}`}>
            <Users className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        {isOwner && (
          <>
            <Button asChild variant="outline">
              <Link href={`/dashboard/events/${event._id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteEventButton eventId={event._id} />
          </>
        )}
      </CardFooter>
    </Card>
  );
} 