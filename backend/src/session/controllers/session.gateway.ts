import { HttpStatus, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { SessionService } from '../services/session.service';

interface YoutubeMessage {
  query: string;
}
interface BaseMessage {
  id: string;
}
interface AddFolderMessage extends BaseMessage {
  name: string;
  parentId?: string;
}
interface AddMusicMessage extends BaseMessage {
  name: string;
  url: string;
  videoId: string;
  parentId?: string;
}
interface MoveMusicMessage extends BaseMessage {
  direction: string;
  nodeId: string;
}
interface RemoveNodeMessage extends BaseMessage {
  nodeId: string;
}
interface RenameNodeMessage extends BaseMessage {
  nodeId: string;
  newName: string;
}

@WebSocketGateway({ cors: '*' })
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SessionGateway.name);

  @WebSocketServer()
  server: Namespace;

  constructor(private readonly sessionService: SessionService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Optionally clean up session
    try {
      this.sessionService.leaveBySocket(client);
    } catch (error) {
      this.logger.error(`Error during cleanup for ${client.id}`, error.stack);
    }
  }

  private validateId(id: any): string {
    if (typeof id !== 'string' || !id.trim()) {
      throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid or missing session id' });
    }
    return id;
  }

  @SubscribeMessage('join')
  join(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BaseMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      this.sessionService.join(sessionId, client);
  }

  @SubscribeMessage('addFolder')
  addFolder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AddFolderMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      if (typeof payload.name !== 'string' || !payload.name.trim()) {
        throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid folder name' });
      }
      this.sessionService.addFolder(
        sessionId,
        payload.name.trim(),
        payload.parentId,
        client
      )
  }

  @SubscribeMessage('addMusic')
  addMusic(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AddMusicMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      ['name', 'url', 'videoId'].forEach((field) => {
        if (typeof payload[field] !== 'string' || !payload[field].trim()) {
          throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Invalid ${field}` });
        }
      });
      this.sessionService.addMusic(
        sessionId,
        payload.name.trim(),
        payload.parentId,
        payload.url.trim(),
        payload.videoId.trim(),
        client
      )
  }

  @SubscribeMessage('moveMusic')
  moveMusic(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MoveMusicMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      ['direction', 'nodeId'].forEach((field) => {
        if (typeof payload[field] !== 'string' || !payload[field].trim()) {
          throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Invalid ${field}` });
        }
      });
      this.sessionService.moveMusic(
        sessionId,
        payload.direction,
        payload.nodeId,
        client
      )
  }

  @SubscribeMessage('removeNode')
  removeNode(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RemoveNodeMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      if (typeof payload.nodeId !== 'string' || !payload.nodeId.trim()) {
        throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid node id' });
      }
      this.sessionService.removeNode(
        sessionId,
        payload.nodeId,
        client
      )
      
  }

  @SubscribeMessage('renameNode')
  renameNode(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RenameNodeMessage,
  ) {
      const sessionId = this.validateId(payload.id);
      if (typeof payload.nodeId !== 'string' || !payload.nodeId.trim()) {
        throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid node id' });
      }
      if (typeof payload.newName !== 'string' || !payload.newName.trim()) {
        throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid new name' });
      }
      this.sessionService.renameNode(
        sessionId,
        payload.nodeId,
        payload.newName.trim(),
        client
      )
  }

  @SubscribeMessage('youtube')
  youtubeQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: YoutubeMessage,
  ) {
      if (typeof payload.query !== 'string' || payload.query.length == 0) {
        throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid query' });
      }
      this.sessionService.searchVideos(payload.query, client)
  }
}
