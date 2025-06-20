import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
import { SessionService } from '../services/session.service';
import { Socket } from 'socket.io';

@WebSocketGateway({cors: '*'})
export class SessionGateway implements OnGatewayDisconnect {
    @WebSocketServer() server;

    constructor(private sessionService: SessionService){}
    
    handleDisconnect(client: any) {
         console.log("disconnected...")
    }

    @SubscribeMessage('join')
    async join(client: Socket, message) {
        if(message.id === undefined) {
            return "Need a blind test id" 
        }
        this.sessionService.join(message.id, client);
    }

    @SubscribeMessage('addFolder')
    async addFolder(client: Socket, message) {
        if(message.id === undefined) {
            return "Need a blind test id" 
        }
        this.sessionService.addFolder(message.id, message.name, message.parentId, client);
    }

    @SubscribeMessage('addMusic')
    async addMusic(client: Socket, message) {
        if(message.id === undefined) {
            return "Need a blind test id" 
        }
        this.sessionService.addMusic(message.id, message.name, message.parentId, message.url, message.videoId, client);
    }

    @SubscribeMessage('removeNode')
    async removeNode(client: Socket, message) {
        if(message.id === undefined) {
            return "Need a blind test id" 
        }
        this.sessionService.removeNode(message.id, message.nodeId, client);
    }

    @SubscribeMessage('renameNode')
    async renameNode(client: Socket, message) {
        if(message.id === undefined) {
            return "Need a blind test id" 
        }
        this.sessionService.renameNode(message.id, message.nodeId, message.newName, client);
    }


}

