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
import { User } from '../services/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [MatListModule, MatToolbarModule, MatDialogModule, CommonModule, MatLineModule, MatIconModule],
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  entries: BlindEntry[] = [];

  api: string = "DOIS CHANGER"

  constructor(
    private blindService: BlindService,
    private dialog: MatDialog,
    private router: Router,
    private cd: ChangeDetectorRef,
    private user: User,
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    this.api = this.user.getApi();
  }

  /** Récupère la liste depuis le service. */
  private loadEntries(): void {
    this.entries = this.blindService.getAll();
    this.cd.detectChanges();
  }

  /** Ouvre le dialogue pour créer une nouvelle entrée. */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEntryDialog, {
      width: '280px',
      data: { name: '' } // on peut passer des données initiales si besoin
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.trim().length > 0) {
        this.blindService.add(result.trim());
        this.loadEntries();
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
    // Si vous souhaitez demander confirmation avant suppression :
    // if (!confirm(`Supprimer "${entry.name}" ?`)) { return; }

    this.blindService.remove(entry.id);
    this.loadEntries();
  }
}
