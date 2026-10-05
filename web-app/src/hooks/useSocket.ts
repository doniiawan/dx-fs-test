import { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

export const useAdminSocketNotification = (onNotification: (data: any) => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    // Connect ke Socket.io server NestJS
    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    // Listen event 'profile_changed_alert' dari backend
    socket.on('profile_changed_alert', (data) => {
      onNotification(data);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [enabled, onNotification]);
};