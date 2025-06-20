import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';



@WebSocketGateway({cors: '*'})
export class SessionGateway implements OnGatewayDisconnect {
    @WebSocketServer() server;
    
    handleDisconnect(client: any) {
        throw new Error('Method not implemented.');
    }

}

