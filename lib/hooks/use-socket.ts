'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/config/env';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
} 