import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule  } from '@angular/material/form-field';


export interface DeleteEntryData {
  owner: boolean;
}

@Component({
  selector: 'app-delete-entry-dialog',
  imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatButtonModule, CommonModule],
  templateUrl: './delete-entry-dialog.html',
  styleUrl: './delete-entry-dialog.css'
})
export class DeleteEntryDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteEntryDialog>,
     @Inject(MAT_DIALOG_DATA) public data: DeleteEntryData
  ) {}
}
