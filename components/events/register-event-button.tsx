'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RegisterEventButtonProps {
  eventId: string;
  isRegistered: boolean;
  isFull: boolean;
  isPast: boolean;
}

export function RegisterEventButton({ 
  eventId, 
  isRegistered, 
  isFull,
  isPast
}: RegisterEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  async function handleRegister() {
    if (!user) {
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Successfully registered for the event',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isPast) {
    return (
      <Button disabled className="w-full">
        Event has ended
      </Button>
    );
  }

  if (isRegistered) {
    return (
      <Button disabled className="w-full">
        ✓ Registered
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled className="w-full">
        Event is full
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleRegister} 
      disabled={isLoading} 
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        'Register'
      )}
    </Button>
  );
} 