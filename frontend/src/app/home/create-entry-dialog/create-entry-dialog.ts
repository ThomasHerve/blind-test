import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CreateEntryData {
  name: string;
}

@Component({
  selector: 'app-create-entry-dialog',
  templateUrl: './create-entry-dialog.html',
  imports: [MatDialogModule, FormsModule, MatLabel, MatFormField, MatFormFieldModule, MatInputModule, MatButtonModule],
  styleUrls: ['./create-entry-dialog.css']
})
export class CreateEntryDialog {
  constructor(
    public dialogRef: MatDialogRef<CreateEntryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateEntryData
  ) {}
}
