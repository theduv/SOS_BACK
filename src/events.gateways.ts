import {
	MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';


@WebSocketGateway(80, {cors: {
	origin: '*',
}})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

	@SubscribeMessage('join')
	test(@MessageBody()arno: string): string {
		return arno
	}
}