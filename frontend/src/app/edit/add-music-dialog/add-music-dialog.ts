import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Youtube } from '../../services/youtube';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-music-dialog',
  templateUrl: './add-music-dialog.html',
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatListModule, MatIconModule],
})
export class AddMusicDialog {
  searchTerm = '';
  results: Array<{ videoId: string; title: string; thumbnail: string }> = [];
  previewId: string | null = null;
  previewUrl: SafeResourceUrl | null = null;

  constructor(
    private yt: Youtube,
    private dialogRef: MatDialogRef<AddMusicDialog>,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSearch(): void {
    this.previewId = null;
    this.results = [];
    if (!this.searchTerm.trim()) return;
    this.yt.searchVideos(this.searchTerm).subscribe(resp => {
      this.results = resp.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url || item.snippet.thumbnails.default.url
      })); this.cd.detectChanges();
    });
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

  select(video: { videoId: string }) {
    const url = `https://www.youtube.com/watch?v=${video.videoId}`;
    this.dialogRef.close(url);
  }

  cancel() {
    this.dialogRef.close();
  }
}