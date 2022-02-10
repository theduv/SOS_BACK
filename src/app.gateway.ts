import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(80)
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() wss: Server
  
  private roomsList = {}

  private logger: Logger = new Logger('AppGateway')
  
  afterInit(server: Server) {
    this.logger.log('Initialized!')
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${client.id}`)
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    // qq
  }

  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: {sender: string, room: string, message: string}) {
    this.wss.to(message.room).emit('chatToClient', message)
  }

  @SubscribeMessage('lockedChoice')
  handleLockChoice(client: Socket, choice: {room: string, choice: string}) {
    const roomName = choice.room
    const targetRoom = this.roomsList[roomName]
  
    this.wss.to(roomName).emit('chatToClient', {type: "info", content: `${client.id} has locked their choice!`})
    const author = targetRoom.players.find((player) => player.playerID === client.id)
    author.hasLocked = choice.choice
    if (targetRoom.players[0].hasLocked && targetRoom.players[1].hasLocked) {
      targetRoom.hasEnded = true
    }
    this.wss.to(roomName).emit('updateRoom', targetRoom)
  }

  onJoinRoom = (id, room,) => {
    const targetRoom = this.roomsList[room]
    if (targetRoom) {
      if (targetRoom.players.length > 1)
        return;
      else {
        const currentPlayers = targetRoom.players;
        targetRoom.players = [...currentPlayers, {playerID: id, hasLocked: false}]
      }
    }
    else {
      const newRoom = {
        id: room,
        hasEnded: false, 
        players: [{playerID: id, hasLocked: false}]
      }
      this.roomsList[room]= newRoom
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room)
    client.emit('joined room', room)
    this.onJoinRoom(client.id, room)
    this.wss.to(room).emit('updateRoom', this.roomsList[room])
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room)
    client.emit('left room', room)
  }
}
