import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/lib/config/env';

class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(server: NetServer): SocketIOServer {
    if (!this.initialized) {
      this.io = new SocketIOServer(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
      });
      this.initialized = true;

      this.io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });
    }
    return this.io!;
  }

  public getIO(): SocketIOServer {
    if (!this.initialized || !this.io) {
      throw new Error('Socket.IO has not been initialized. Call init() first.');
    }
    return this.io;
  }

  public emitEventUpdate(eventId: string, update: { type: string; data: any }) {
    try {
      if (!this.initialized || !this.io) {
        console.warn('Socket.IO not initialized, skipping event update');
        return;
      }
      this.io.emit(`event:${eventId}`, update);
    } catch (error) {
      console.error('Socket emission error:', error);
    }
  }
}

export const socketService = SocketService.getInstance();
export const initSocketServer = (server: NetServer) => socketService.init(server);
export const getIO = () => socketService.getIO();
export const emitEventUpdate = (eventId: string, update: Parameters<typeof socketService.emitEventUpdate>[1]) => {
  try {
    socketService.emitEventUpdate(eventId, update);
  } catch (error) {
    console.warn('Failed to emit event update:', error);
  }
}; 