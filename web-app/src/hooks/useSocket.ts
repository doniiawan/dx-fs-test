import { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../lib/api';

let socket: Socket;

export const useAdminSocketNotification = (onNotification: (data: any) => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    // Connect ke Socket.io server NestJS
    socket = io(getApiBaseUrl());

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