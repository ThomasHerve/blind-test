import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { RuntimeEnv } from './runtime-env';

export interface FolderNode {
  id: string;
  name: string;
  children: FolderNode[];
  url: string;
  prof: number;
  type: boolean;
  videoId: string;
}

@Injectable({ providedIn: 'root' })
export class FolderService {
  private socket: Socket;
  private treeSubject = new BehaviorSubject<FolderNode[]>([]);
  public tree$ = this.treeSubject.asObservable();
  private apiUrl = '';

  constructor(private http: HttpClient, private envService: RuntimeEnv) {
    this.apiUrl = this.envService.socketUrl
    this.socket = io(this.apiUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    // Listen for real-time tree updates
    this.socket.on('tree', (payload: { tree: FolderNode[] }) => {
      console.log(payload.tree)
      this.treeSubject.next(payload.tree);
    });

    this.socket.on('error', (err: any) => console.error('Socket error:', err));
  }

  init(blindId: string, token: string): void {
    this.socket.io.opts.extraHeaders = { Authorization: `Bearer ${token}` };
    this.socket.emit('join', { id: blindId });
  }

  addFolder(blindId: string, name: string, parentId?: string): void {
    this.socket.emit('addFolder', { id: blindId, name: name.trim(), parentId });
  }

  addMusic(blindId: string, name: string, url: string, videoId: string, parentId?: string): void {
    this.socket.emit('addMusic', {
      id: blindId,
      name: name.trim(),
      parentId,
      url,
      videoId
    });
  }

  renameNode(blindId: string, nodeId: string, newName: string): void {
    this.socket.emit('renameNode', {
      id: blindId,
      nodeId,
      newName: newName.trim(),
    });
  }

  removeNode(blindId: string, nodeId: string): void {
    this.socket.emit('removeNode', { id: blindId, nodeId });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
