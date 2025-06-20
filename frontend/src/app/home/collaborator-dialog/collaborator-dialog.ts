import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BlindService } from '../../services/blind';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListItem, MatListModule } from '@angular/material/list';

export interface CollaboratorDialogData {
  title: string;
  users: string[],
  id: number
}

@Component({
  selector: 'app-collaborator-dialog',
  imports: [MatDialogModule, FormsModule, MatLabel, MatFormField, MatFormFieldModule, MatInputModule, MatButtonModule, MatDividerModule, CommonModule, MatIconModule, MatListItem, MatListModule],
  templateUrl: './collaborator-dialog.html',
  styleUrl: './collaborator-dialog.css'
})
export class CollaboratorDialog {
    users: string[];
    newUsername = '';
    errorMessage = '';
    opacity = 1;

    constructor(
      private dialogRef: MatDialogRef<CollaboratorDialog>,
      @Inject(MAT_DIALOG_DATA) public data: CollaboratorDialogData,
      private blindService: BlindService,
      private cd: ChangeDetectorRef,
    ) {
      // Clone the incoming users array to avoid mutating parent data directly
      this.users = [...data.users];
    }

    onAdd(): void {
    const username = this.newUsername.trim();
    if (!username) return;
    this.blindService.addCollaborator(username, this.data.id).subscribe({
      next: () => {
        this.users.push(username);
        this.newUsername = '';
      },
      error: err => {
        if (err.status === 404) {
          this.showError("L'utilisateur n'existe pas");
        } else {
          console.error('Erreur ajout collaborateur', err);
        }
      }
    });
  }

  onRemove(username: string): void {
    this.blindService.removeCollaborator(username, this.data.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u !== username);
      },
      error: err => {
        console.error('Erreur ajout collaborateur', err);
      }
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.cd.detectChanges();
    // fade out after 3 seconds
    this.decay(30, 30)
  }

  decay(total: number, timesRemaining: number) {
    if (timesRemaining <= 0) {
      this.errorMessage = '';
      this.cd.detectChanges();
      return;
    } 

    // Action ici
    this.opacity =  timesRemaining / total;     
    this.cd.detectChanges();

    setTimeout(() => {
      this.decay(total, timesRemaining - 1);
    }, 100);
}

  onClose(): void {
    this.dialogRef.close(this.users);
  }
}
