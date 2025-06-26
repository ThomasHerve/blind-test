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
import { FolderNode, FolderService } from '../services/folder';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FormsModule } from '@angular/forms';
import { AddMusicDialog } from './add-music-dialog/add-music-dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  previewId: string | null = null;
  previewUrl: SafeResourceUrl | null = null;  
  
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private blindService = inject(BlindService);
  
  blindId!: string;
  treeControl = new NestedTreeControl<FolderNode>(node => node.childrens);
  dataSource = new MatTreeNestedDataSource<FolderNode>();
  entry: BlindEntry | undefined;
  
  editingNodeId: string | null = null;
  editName: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private folderService: FolderService,
  ) {}

  ngOnInit(): void {
    this.blindId = this.route.snapshot.paramMap.get('id')!;
    this.blindService.getById(this.blindId).subscribe((res)=>{
      this.entry = res;
      this.previewId = null;
      this.loadTree();
    });
  }

  loadTree(): void {
    this.folderService.init(this.blindId)
    this.folderService.tree$.subscribe((next)=>{
      this.dataSource.data = next
      this.treeControl.dataNodes = next;
      this.treeControl.expandAll();
      this.cd.detectChanges();
    })
  }

  hasChild = (_: number, node: FolderNode) => !!node.childrens && node.childrens.length > 0;

  downloadTree() {
    this.blindService.downloadTree(this.blindId).subscribe((obj)=>{
          let filename  = "";
          if(this.entry)
            filename = this.entry?.title;
          const jsonStr = JSON.stringify(obj, null, 2);
          const blob    = new Blob([jsonStr], { type: 'application/json' });
          const url     = window.URL.createObjectURL(blob);

          const a        = document.createElement('a');
          a.href         = url;
          a.download     = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();

          // cleanup
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

    })
  }

  addFolder(parent: FolderNode | null): void {
    const dialogRef = this.dialog.open(AddFolderDialog, {
      width: '280px',
      data: { name: '' }
    });
    dialogRef.afterClosed().subscribe(name => {
      if (name && name.trim()) {
        this.folderService.addFolder(this.blindId, name, parent?.id || undefined);
      }
    });
  }

  addMusic(parent: FolderNode | null) {
    const dialogRef = this.dialog.open(AddMusicDialog, {
      width: '800px',
      data: {} // on peut passer des données si besoin
    });

    dialogRef.afterClosed().subscribe((video: {url: string, title: string, id: string}) => {
      if (video && video.url) {
        console.log('URL sélectionnée:', video.url);
        this.folderService.addMusic(this.blindId, video.title, video.url, video.id, parent?.id);
      }
    });
  }

  moveMusic(direction: string, node: FolderNode) {
    console.debug("moveMusic");
    this.folderService.moveMusic(this.blindId, direction, node.id)
  }

  deleteNode(node: FolderNode): void {
    console.debug('deleteNode', node)
    if (confirm(`Supprimer le dossier "${node.name}" et tout son contenu ?`)) {
      this.folderService.removeNode(this.blindId, node.id);
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

  togglePreview(videoId: string): void {
    if (this.previewId === videoId) {
      this.previewId = null;
      this.previewUrl = null;
    } else {
      this.previewId = videoId;
      const url = `https://www.youtube.com/embed/${videoId}`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  goBack(): void {
    window.history.back();
  }

}
