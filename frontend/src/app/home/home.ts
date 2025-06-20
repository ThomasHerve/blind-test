import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BlindService, BlindEntry } from '../services/blind';
import { CreateEntryDialog } from './create-entry-dialog/create-entry-dialog';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatLineModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../shared/user/user';
import { DeleteEntryDialog } from './delete-entry-dialog/delete-entry-dialog';
import { CollaboratorDialog } from './collaborator-dialog/collaborator-dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [MatListModule, MatToolbarModule, MatDialogModule, CommonModule, MatLineModule, MatIconModule, MatButtonModule],
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  entries: BlindEntry[] = [];
  connected: boolean = false;

  constructor(
    private blindService: BlindService,
    private dialog: MatDialog,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    User.currentUser$.subscribe((user)=>{
      console.log(this)
      this.loadEntries();
    })
    //User.subscribeEvent(this.loadEntries);
  }

  /** Récupère la liste depuis le service. */
  private loadEntries(): void {
    if(User.user != null) {
      this.connected = true; 
      this.blindService.getAll().subscribe((res)=>{
        console.log(res)
          this.entries = res
          this.cd.detectChanges();
      })
    }
    else {
      this.connected = false;
      this.entries = []
    }
  }

  /** Ouvre le dialogue pour créer une nouvelle entrée. */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEntryDialog, {
      width: '380px',
      data: { name: '' } // on peut passer des données initiales si besoin
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.trim().length > 0) {
        this.blindService.add(result.trim()).subscribe((res)=>{
          console.log("Entrée créée")
          this.loadEntries();

        });
      }
    });
  }

  /** Gère le clic sur une entrée (pour aller plus tard vers l’édition). */
  onEntryClick(entry: BlindEntry): void {
    // Pour l'instant, on se contente de naviguer vers une route d'édition (non encore implémentée)
    // Par exemple : /edit/:id
    this.router.navigate(['/edit', entry.id]);
  }

  deleteEntry(entry: BlindEntry): void {
    const dialogRef = this.dialog.open(DeleteEntryDialog, {
      width: '380px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.blindService.remove(entry.id).subscribe((res)=>{
          this.loadEntries();
        });
      }
    });

  }

  manageCollaborators(entry: BlindEntry): void {
    const dialogRef = this.dialog.open(CollaboratorDialog, {
      width: '380px',
      data: {
        title: entry.title,
        users: entry.users,
        id: entry.id
      }
    });

  dialogRef.afterClosed().subscribe(updatedUsers => {
    if (updatedUsers) {
      entry.users = updatedUsers;
    }
  });
  }
}
