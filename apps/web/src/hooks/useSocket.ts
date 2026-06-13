import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Alert } from '@/lib/api';

interface SocketOptions {
  onAlert?: (alert: Alert) => void;
  onWhaleMove?: (data: unknown) => void;
  onBattleUpdate?: (data: unknown) => void;
}

export function useSocket(options: SocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const socket = io(url, {
      transports: ['websocket'],
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('alert:new', (data: Alert) => options.onAlert?.(data));
    socket.on('whale:move', (data: unknown) => options.onWhaleMove?.(data));
    socket.on('battle:update', (data: unknown) => options.onBattleUpdate?.(data));

    return () => { socket.disconnect(); };
  }, []); // eslint-disable-line

  return socketRef;
}
