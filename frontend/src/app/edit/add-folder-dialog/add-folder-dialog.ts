import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export interface AddFolderData {
  name: string;
}

@Component({
  selector: 'app-add-folder-dialog',
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './add-folder-dialog.html',
  styleUrl: './add-folder-dialog.css'
})
export class AddFolderDialog {
  constructor(
    public dialogRef: MatDialogRef<AddFolderDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AddFolderData
  ) {}
}

