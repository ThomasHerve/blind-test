import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { Socket } from 'socket.io';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private clients: Record<string, string> = {}; // socket.id -> blindId
  private rooms: Record<string, Socket[]> = {} // blindId -> sockets[]

  constructor(
    @InjectRepository(BlindEntry) private readonly BlindEntriesRepository: Repository<BlindEntry>,
    @InjectRepository(BlindNode) private readonly NodeRepository: Repository<BlindNode>,
    private readonly userService: UsersService
  ) {}

  async sendTree(blindId: string) {
    const blind = await this.BlindEntriesRepository.findOne({
      where: { id: parseInt(blindId) },
      relations: ['entries'],
    });
    if (!blind) {
      throw new NotFoundException('Blind test not found');
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

    this.rooms[`room-${blindId}`].forEach(client => {
      client.emit("tree", { blindId: blindId, tree: toSend });
    });
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
    videoId:     instance.videoId
  };
}

  async join(blindId: string, client: Socket) {
    const blind = await this.BlindEntriesRepository.findOne({
      where: { id: parseInt(blindId) },
      relations: ['entries'],
    });

    if (!blind) {
      throw new NotFoundException('Blind test not found');
    }

    this.clients[client.id] = blindId;
    if(!this.rooms[`room-${blindId}`]) {
      this.rooms[`room-${blindId}`] = []
    }
    this.rooms[`room-${blindId}`].push(client)
    this.sendTree(blindId)
    this.logger.log(`Client ${client.id} joined room ${blindId}`);
  }

  async addFolder(blindId: string, name: string, parentId: string | undefined) {
    const blind = await this.BlindEntriesRepository.findOneBy({ id: parseInt(blindId) });
    if (!blind) throw new NotFoundException('Blind test not found');

    const node = new BlindNode();
    node.name = name;
    node.url = '';
    node.type = false; // folder
    node.blind = blind;
    node.videoId = '';
    node.prof = 0;

    if (parentId) {
      const parent = await this.NodeRepository.findOneBy({ id: parseInt(parentId) });
      if (!parent) throw new NotFoundException('Parent node not found');
      node.parent = parent;
      node.prof = parent.prof + 1;
      if(!parent.childrens)
        parent.childrens = [node]
      else
        parent.childrens.push(node)
      await this.NodeRepository.save(parent);
    }

    const saved = await this.NodeRepository.save(node);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('folderAdded', saved)})
    this.sendTree(blindId)

    return node.id
  }

  async addMusic(
    blindId: string,
    name: string,
    parentId: string | undefined,
    url: string,
    videoId: string,
  ) {
    const blind = await this.BlindEntriesRepository.findOneBy({ id: parseInt(blindId) });
    if (!blind) throw new NotFoundException('Blind test not found');

    const node = new BlindNode();
    node.name = name;
    node.url = url;
    node.videoId = videoId;
    node.type = true;
    node.blind = blind;
    node.prof = 0;

    if (parentId) {
      const parent = await this.NodeRepository.findOneBy({ id: parseInt(parentId) });
      if (!parent) throw new NotFoundException('Parent node not found');
      node.parent = parent;
      node.prof = parent.prof + 1;
      if(!parent.childrens)
        parent.childrens = [node]
      else
        parent.childrens.push(node)
      await this.NodeRepository.save(parent);
    }

    const saved = await this.NodeRepository.save(node);
    //this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('musicAdded', saved)})
    this.sendTree(blindId)

    return node.id
  }

  async removeNode(blindId: string, nodeId: string) {
    const node = await this.NodeRepository.findOne({
      where: { id: parseInt(nodeId) },
      relations: ['blind'],
    });
    if (!node || node.blind.id !== parseInt(blindId)) {
      throw new NotFoundException('Node not found or does not belong to blind test');
    }

    await this.NodeRepository.remove(node);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('nodeRemoved', { nodeId })})
    this.sendTree(blindId)
  }

  async renameNode(blindId: string, nodeId: string, newName: string) {
    const node = await this.NodeRepository.findOne({
      where: { id: parseInt(nodeId) },
      relations: ['blind'],
    });
    if (!node || node.blind.id !== parseInt(blindId)) {
      throw new NotFoundException('Node not found or does not belong to blind test');
    }

    node.name = newName;
    const updated = await this.NodeRepository.save(node);
    this.rooms[`room-${blindId}`].forEach((client)=>{client.emit('nodeRenamed', updated)})
    this.sendTree(blindId)
  }

  leaveBySocket(client: Socket) {
    const blindId = this.clients[client.id];
    if (blindId) {
      this.rooms[`room-${this.clients[client.id]}`] = this.rooms[`room-${this.clients[client.id]}`].filter((c)=>client.id != c.id)
      delete this.clients[client.id];
    }
  }
}