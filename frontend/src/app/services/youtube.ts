import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import de la clé protégée
import { YOUTUBE_API_KEY } from '../config/secrets';

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: { title: string; thumbnails: any };
  }>;
}

@Injectable({ providedIn: 'root' })
export class Youtube {
  private apiKey = YOUTUBE_API_KEY;
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';

  constructor(private http: HttpClient) {}

  searchVideos(query: string): Observable<YouTubeSearchResponse> {
    const params = new HttpParams()
      .set('part', 'snippet')
      .set('type', 'video')
      .set('maxResults', '10')
      .set('q', query)
      .set('key', this.apiKey);
    return this.http.get<YouTubeSearchResponse>(this.apiUrl, { params });
  }
}