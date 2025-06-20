import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { Socket } from 'socket.io';

@Injectable()
export class SessionService {
    
    clients = {}

    constructor(
        @InjectRepository(BlindEntry) private readonly BlindEntriesRepository: Repository<BlindEntry>,
        @InjectRepository(BlindNode) private readonly NodeRepository: Repository<BlindNode>,
        private readonly userService: UsersService
      ) {}
    
      join(id: number, client: Socket) {
        
      }

      addFolder(id: number, name: string, parentId: string | null, client: Socket) {

      }

      addMusic(id: number, name: string, parentId: string | null, url: string, videoId: string, client: Socket) {

      }

      removeNode(id: number, nodeId: string, client: Socket) {

      }

      renameNode(id: number, nodeId: string, newName: string, client: Socket) {
      
      }

      private sendTree(client: Socket) {

      }

}
