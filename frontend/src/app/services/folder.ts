import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'; // install uuid

export enum folderType {
  FOLDER,
  MUSIC
}

export interface FolderNode {
  id: string;
  name: string;
  children: FolderNode[];
  url: string;
  prof: number;
  type: folderType;
  videoId: string;
}

@Injectable({ providedIn: 'root' })
export class Folder {
  private storageKey = 'blindFolders';

  constructor() {}

  /** Récupère l'arborescence pour un blind donné */
  getTree(blindId: string): FolderNode[] {
    const raw = localStorage.getItem(this.storageKey + '_' + blindId);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as FolderNode[];
    } catch {
      return [];
    }
  }

  /** Sauvegarde l'arborescence */
  saveTree(blindId: string, tree: FolderNode[]): void {
    localStorage.setItem(this.storageKey + '_' + blindId, JSON.stringify(tree));
  }

  addFolder(blindId: string, name: string, parentId: string | null = null): FolderNode {
    const tree = this.getTree(blindId);
    let parent = undefined
    let prof = 0

    if (parentId) {
      parent = this.findNode(tree, parentId);
      if(parent){
        prof = parent.prof + 1
      }
    }
    const newNode: FolderNode = { id: uuidv4(), name: name.trim(), children: [], type: folderType.FOLDER, prof: prof, url: "", videoId: "" };
    if (!parentId) {
      tree.push(newNode);
    } else {
      parent?.children.push(newNode);
    }
    this.saveTree(blindId, tree);
    return newNode;
  }

  addMusic(blindId: string, name: string, parentId: string | null = null, url: string, id: string): FolderNode {
    const tree = this.getTree(blindId);
    let parent = undefined
    if (parentId) {
      parent = this.findNode(tree, parentId);
    }
    let prof = 0

    if(parent){
      prof = parent.prof + 1
    }

    const newMusic: FolderNode = { id: uuidv4(), name: name, prof: prof, url: url, videoId: id, children: [], type: folderType.MUSIC };
    parent?.children.push(newMusic);
    this.saveTree(blindId, tree)
    return newMusic
  }

  /** Supprime un dossier (et ses enfants) */
  removeNode(blindId: string, nodeId: string): void {
    let tree = this.getTree(blindId);
    tree = this._removeNodeRecursive(tree, nodeId);
    this.saveTree(blindId, tree);
  }

  /** Recherche récursive */
  private findNode(tree: FolderNode[], id: string): FolderNode | undefined {
    for (const node of tree) {
      if (node.id === id) return node;
      const child = this.findNode(node.children, id);
      if (child) return child;
    }
    return undefined;
  }

  private _removeNodeRecursive(tree: FolderNode[], id: string): FolderNode[] {
    return tree.filter(n => n.id !== id).map(n => ({
      ...n,
      children: this._removeNodeRecursive(n.children, id)
    }));
  }

  /** Renomme un dossier */
  renameNode(blindId: string, nodeId: string, newName: string): void {
    const tree = this.getTree(blindId);
    const node = this.findNode(tree, nodeId);
    if (node) node.name = newName.trim();
    this.saveTree(blindId, tree);
  }

}
