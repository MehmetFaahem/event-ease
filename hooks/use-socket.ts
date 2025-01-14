'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/context/auth-context';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
    });

    // Connection error handling
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const joinEvent = (eventId: string) => {
    socketRef.current?.emit('join-event', eventId);
  };

  const leaveEvent = (eventId: string) => {
    socketRef.current?.emit('leave-event', eventId);
  };

  const subscribeToEvent = (eventId: string, callback: (data: any) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on(`event:${eventId}:update`, callback);
    return () => {
      socketRef.current?.off(`event:${eventId}:update`, callback);
    };
  };

  return {
    socket: socketRef.current,
    joinEvent,
    leaveEvent,
    subscribeToEvent,
  };
} 