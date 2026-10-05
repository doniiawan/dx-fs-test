import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendAdminNotification(data: { userId: string; userName?: string; phoneNumber?: string; message: string; timestamp: Date }) {
    this.server.emit('profile_changed_alert', data);
  }
}