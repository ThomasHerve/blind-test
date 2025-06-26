import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';


interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: { title: string; thumbnails: any };
  }>;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private clients: Record<string, string> = {}; // socket.id -> blindId
  private rooms: Record<string, Socket[]> = {} // blindId -> sockets[]
  private readonly apiKey: string | undefined;
  
  constructor(
    @InjectRepository(BlindEntry) private readonly BlindEntriesRepository: Repository<BlindEntry>,
    @InjectRepository(BlindNode) private readonly NodeRepository: Repository<BlindNode>,
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly userService: UsersService
  ) {
    this.apiKey = this.config.get<string>('YOUTUBE_API_KEY');
    if (!this.apiKey) {
      this.logger.error('YOUTUBE_API_KEY is not defined');
      throw new Error('YouTube API key missing');
    }
  }

  sendError(message: string, client: Socket) {
    client.emit("error", message)
  }

  async searchVideos(query: string, client: Socket, maxResults = 10) {
    if (!query) {
      this.sendError('query needed', client);
      return
    }

    const params = {
      part: 'snippet',
      type: 'video',
      maxResults: maxResults.toString(),
      q: query,
      key: this.apiKey,
    };

    try {
      const response$ = this.http.get<YouTubeSearchResponse>('/search', { params });
      const response = await firstValueFrom(
        response$.pipe(
          map(res => res.data),
          catchError(err => {
            this.logger.error('YouTube API error', err.response?.data || err.message);
            throw err;
          }),
        ),
      );
      client.emit("youtube", response)
    } catch (err) {
        this.sendError('Youtube API error: ' + err, client);
    }
  }

  async sendTree(blindId: string, client: Socket) {
    const blind = await this.BlindEntriesRepository.findOne({
      where: { id: parseInt(blindId) },
      relations: ['entries'],
    });
    if (!blind) {
      this.sendError('Blind test not found', client);
      return;
    }

    const treeResults = await Promise.all(
      blind.entries.map(async node => {
        const instance = await this.NodeRepository.findOne({where: { id: node.id }, relations: ['blind', 'parent', 'childrens']});
        if (instance && instance.parent == null) {
          return this.buildTree(node);
        }
        return null;
      })
    );
    

    const toSend = treeResults.filter(tree => tree !== null);


    toSend.forEach(element => {
      element.childrens.sort((a, b) => a.position - b.position)
    });
    try {
    this.rooms[`room-${blindId}`].forEach(client => {
      client.emit("tree", { blindId: blindId, tree: toSend });
    });
    } catch {}
  }

async buildTree(node: BlindNode): Promise<any> {
  const instance = await this.NodeRepository.findOne({
    where: { id: node.id },
    relations: ['blind', 'parent', 'childrens']
  });

  if (!instance) {
    return null;
  }

  const childrens = await Promise.all(
    instance.childrens.map(child => this.buildTree(child))
  );

  return {
    id:          instance.id,
    name:        instance.name,
    url:         instance.url,
    childrens:   childrens,
    prof:        instance.prof,
    type:        instance.type,
    videoId:     instance.videoId,
    position:    instance.position
  };
}

  async join(blindId: string, client: Socket) {
    const blind = await this.BlindEntriesRepository.findOne({
      where: { id: parseInt(blindId) },
      relations: ['entries'],
    });

    if (!blind) {
      this.sendError('Blind test not found', client);
      return;
    }

    this.clients[client.id] = blindId;
    if(!this.rooms[`room-${blindId}`]) {
      this.rooms[`room-${blindId}`] = []
    }
    this.rooms[`room-${blindId}`].push(client)
    this.sendTree(blindId, client)
    this.logger.log(`Client ${client.id} joined room ${blindId}`);
  }

  async addFolder(blindId: string, name: string, parentId: string | undefined, client: Socket) {
    const blind = await this.BlindEntriesRepository.findOneBy({ id: parseInt(blindId) });
    if (!blind) {
      this.sendError('Blind test not found', client);
      return;
    } 

    const node = new BlindNode();
    node.name = name;
    node.url = '';
    node.type = false; // folder
    node.blind = blind;
    node.videoId = '';
    node.prof = 0;

    if (parentId) {
      const parent = await this.NodeRepository.findOne({ where:  {id: parseInt(parentId)}, relations: ["childrens"] });
      if (!parent){
        this.sendError('Parent node not found', client);
        return;
      }
      node.parent = parent;
      node.prof = parent.prof + 1;
      node.position = parent.childrens.length;
      // console.log(parent)
      if(!parent.childrens)
        parent.childrens = [node]
      else
        parent.childrens.push(node)
      await this.NodeRepository.save(parent);
    }

    const saved = await this.NodeRepository.save(node);
    this.sendTree(blindId, client)
  }

  async addMusic(
    blindId: string,
    name: string,
    parentId: string | undefined,
    url: string,
    videoId: string,
    client: Socket
  ) {
    const blind = await this.BlindEntriesRepository.findOneBy({ id: parseInt(blindId) });
    if (!blind) {
      this.sendError('Blind test not found', client);
      return;
    }

    const node = new BlindNode();
    node.name = name;
    node.url = url;
    node.videoId = videoId;
    node.type = true;
    node.blind = blind;
    node.prof = 0;

    if (parentId) {
      const parent = await this.NodeRepository.findOne({ where:  {id: parseInt(parentId)}, relations: ["childrens"] });
      if (!parent) {
        this.sendError('Parent node not found', client);
        return;
      }
      node.parent = parent;
      node.prof = parent.prof + 1;
      node.position = parent.childrens.length;
      if(!parent.childrens)
        parent.childrens = [node]
      else
        parent.childrens.push(node)
      await this.NodeRepository.save(parent);
    }

    const saved = await this.NodeRepository.save(node);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('musicAdded', {
      name: saved.name,
      id: saved.id,
      videoId: saved.videoId,
      url: saved.url
    })})
    this.sendTree(blindId, client)
  }

  async moveMusic(blindId: string, direction: string, nodeId: string, client: Socket) {
    const node = await this.NodeRepository.findOne({
      where: { id: parseInt(nodeId) },
      relations: ['blind', 'parent.childrens'],
    });
    if (!node || node.blind.id != parseInt(blindId)) {
      this.sendError('Node not found or does not belong to blind test', client);
      return;
    }

    const parent = node.parent;

    // console.log(parent)

    if (!parent) {
      this.sendError("Can't find the parent", client);
      return;
    }

    let i = node.position;
    // console.log("node position", node.position)

    if (i == 0 && direction === "up") {
      this.sendError('This music is already the first one', client);
      return;
    }
    else if (i == parent.childrens.length - 1 && direction === "down") {
      this.sendError('This music is already the last one', client);
      return;
    }
    
    let childToModify;

    if (direction === "up") {
      childToModify = parent.childrens.find(child => child.position === i - 1);
      if (!childToModify) {
        this.sendError('A weird error occured', client);
        return;
      }
      childToModify.position = i;
      node.position = i - 1;
    }
    else if (direction == "down") {
      childToModify = parent.childrens.find(child => child.position === i + 1);
      if (!childToModify) {
        this.sendError('A weird error occured', client);
        return;
      }
      childToModify.position = i;
      node.position = i + 1;
    }
    else {
      this.sendError('Wrong direction to move', client)
      return;
    }

    const updated = await this.NodeRepository.save(childToModify);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('nodeMoved', updated)})
    const nodeUpdated = await this.NodeRepository.save(node);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('nodeMoved', nodeUpdated)})
    this.sendTree(blindId, client)
  }

  async removeNode(blindId: string, nodeId: string, client: Socket) {
    const node = await this.NodeRepository.findOne({
      where: { id: parseInt(nodeId) },
      relations: ['blind', 'parent.childrens'],
    });
    if (!node || node.blind.id != parseInt(blindId)) {
      this.sendError('Node not found or does not belong to blind test', client);
      return;
    }


    if (node.parent) {
      let i = 0;
      const position = node.position;

      node.parent.childrens.forEach(async (n)=>{
        if(n.position > position) {
          n.position--;
          await this.NodeRepository.save(n);
        }
      })
    }

    await this.NodeRepository.remove(node);
    this.sendTree(blindId, client)
  }

  async renameNode(blindId: string, nodeId: string, newName: string, client: Socket) {
    const node = await this.NodeRepository.findOne({
      where: { id: parseInt(nodeId) },
      relations: ['blind'],
    });
    if (!node || node.blind.id != parseInt(blindId)) {
      this.sendError('Node not found or does not belong to blind test', client);
      return;
    }

    node.name = newName;
    const updated = await this.NodeRepository.save(node);
    this.sendTree(blindId, client)
  }

  leaveBySocket(client: Socket) {
    const blindId = this.clients[client.id];
    if (blindId) {
      delete this.clients[client.id];
    }
  }
}