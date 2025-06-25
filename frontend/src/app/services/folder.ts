import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { RuntimeEnv } from './runtime-env';

export interface FolderNode {
  id: string;
  name: string;
  parent: FolderNode;
  childrens: FolderNode[];
  url: string;
  prof: number;
  type: boolean;
  videoId: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: { title: string; thumbnails: any };
  }>;
}

@Injectable({ providedIn: 'root' })
export class FolderService {
  private socket: Socket;
  private treeSubject = new BehaviorSubject<FolderNode[]>([]);
  public tree$ = this.treeSubject.asObservable();
  public youtubeSubject = new BehaviorSubject<YouTubeSearchResponse | null>(null);
  public youtube$ = this.youtubeSubject.asObservable();
  private apiUrl = '';

  constructor(private http: HttpClient, private envService: RuntimeEnv) {
    this.apiUrl = this.envService.socketUrl
    this.socket = io(this.apiUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    // Listen for real-time tree updates
    this.socket.on('tree', (payload: { tree: FolderNode[] }) => {
      console.log("socket tree", payload.tree)
      this.treeSubject.next(payload.tree);
    });

    this.socket.on("youtube", (payload =>{
      this.youtubeSubject.next(payload)
    }))

    this.socket.on('error', (err: any) => console.error('Socket error:', err));
  }

  init(blindId: string, ): void {
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

  moveMusic(blindId: string, direction: string, nodeId: string) {
    console.log("uwu")
    this.socket.emit('moveMusic', {id: blindId, direction, nodeId})
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

  searchVideos(query: string) {
    this.socket.emit("youtube", {query: query});
  }
}
