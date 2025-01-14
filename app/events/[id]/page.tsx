'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/context/auth-context';
import type { Event } from '@/lib/types';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { joinEvent, leaveEvent, subscribeToEvent } = useSocket();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
    joinEvent(id as string);

    const unsubscribe = subscribeToEvent(id as string, (updatedEvent: Event) => {
      setEvent(updatedEvent);
    });

    return () => {
      leaveEvent(id as string);
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch event details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event || !user) return;

    setIsRegistering(true);
    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      toast({
        title: 'Success',
        description: 'Successfully registered for the event',
      });

      const updatedEvent = await response.json();
      setEvent(updatedEvent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register for the event',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Replace with proper skeleton
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const isRegistered = event.attendees.includes(user?.id || '');
  const isFull = event.currentAttendees >= event.maxAttendees;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
            <Badge variant={isFull ? 'destructive' : 'outline'}>
              {event.currentAttendees}/{event.maxAttendees} attendees
            </Badge>
          </div>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
          <CardDescription className="text-lg">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-5 w-5" />
                {format(new Date(event.date), 'PPP')}
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                {event.location}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-5 w-5" />
                {event.currentAttendees} people attending
              </div>
            </div>

            {user && event.status === 'published' && (
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={isRegistered || isFull || isRegistering}
              >
                {isRegistering
                  ? 'Registering...'
                  : isRegistered
                  ? 'Registered'
                  : isFull
                  ? 'Event Full'
                  : 'Register'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 