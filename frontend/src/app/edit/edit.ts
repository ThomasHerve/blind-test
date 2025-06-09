import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { BlindService, BlindEntry } from '../services/blind';
import { AddFolderDialog } from './add-folder-dialog/add-folder-dialog';
import { MatTreeModule } from '@angular/material/tree';
import { Folder, FolderNode } from '../services/folder';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormsModule } from '@angular/forms';
import { AddMusicDialog } from './add-music-dialog/add-music-dialog';


@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTreeModule,
    FormsModule
  ],
  templateUrl: './edit.html',
  styleUrls: ['./edit.css']
})
export class Edit implements OnInit {
  private route = inject(ActivatedRoute);
  private folderService = inject(Folder);
  private dialog = inject(MatDialog);
  private blindService = inject(BlindService);
  
  blindId!: string;
  treeControl = new NestedTreeControl<FolderNode>(node => node.children);
  dataSource: FolderNode[] = [];
  entry: BlindEntry | undefined;
  
  editingNodeId: string | null = null;
  editName: string = '';

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.blindId = this.route.snapshot.paramMap.get('id')!;
    this.entry = this.blindService.getById(this.blindId);
    this.loadTree();
  }

  loadTree(): void {
    this.dataSource = this.folderService.getTree(this.blindId);
    this.treeControl.dataNodes = this.dataSource;
    this.treeControl.expandAll(); // ou rien pour collapsed par défaut
    this.cd.detectChanges();
  }

  hasChild = (_: number, node: FolderNode) => !!node.children && node.children.length > 0;

  addFolder(parent: FolderNode | null): void {
    const dialogRef = this.dialog.open(AddFolderDialog, {
      width: '280px',
      data: { name: '' }
    });
    dialogRef.afterClosed().subscribe(name => {
      if (name && name.trim()) {
        this.folderService.addFolder(this.blindId, name, parent?.id || null);
        this.loadTree();
      }
    });
  }

  addMusic(parent: FolderNode | null) {
    const dialogRef = this.dialog.open(AddMusicDialog, {
      width: '800px',
      data: {} // on peut passer des données si besoin
    });

    dialogRef.afterClosed().subscribe((url: string) => {
      if (url) {
        console.log('URL sélectionnée:', url);
        // Traitez l'URL (ajout à une liste, envoi au serveur, etc.)
      }
    });
  }

  deleteNode(node: FolderNode): void {
    if (confirm(`Supprimer le dossier "${node.name}" et tout son contenu ?`)) {
      this.folderService.removeNode(this.blindId, node.id);
      this.loadTree();
    }
  }

  startRename(node: FolderNode): void {
    this.editingNodeId = node.id;
    this.editName = node.name;
  }

  // Valider le renommage inline
  finishRename(node: FolderNode): void {
    if (this.editName.trim()) {
      node.name = this.editName.trim();
      this.folderService.renameNode(this.blindId, node.id, this.editName);
    }
    this.editingNodeId = null;
    this.editName = '';
  }

  getPadding(node: FolderNode) {
    return node.prof * 8
  }

  goBack(): void {
    window.history.back();
  }

}
