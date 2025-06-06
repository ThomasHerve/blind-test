import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';

export interface CreateEntryData {
  name: string;
}

@Component({
  selector: 'app-create-entry-dialog',
  templateUrl: './create-entry-dialog.html',
  imports: [MatDialogModule, FormsModule, MatLabel, MatFormField],
  styleUrls: ['./create-entry-dialog.css']
})
export class CreateEntryDialog {
  constructor(
    public dialogRef: MatDialogRef<CreateEntryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateEntryData
  ) {}
}
