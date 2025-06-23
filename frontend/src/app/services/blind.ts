import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RuntimeEnv } from './runtime-env';
import { catchError, map, Observable } from 'rxjs';
import { User } from '../shared/user/user';

export interface BlindEntry {
  id: string;    // identifiant unique (timestamp ou UUID)
  title: string;  // nom de l’entrée
  isOwner: boolean,
  users: string[]
}

@Injectable({
  providedIn: 'root'
})
export class BlindService {
  private storageKey = 'blindEntries';
  private apiUrl = '';
  
  constructor(private envService: RuntimeEnv, private http: HttpClient) {
    this.apiUrl = this.envService.apiUrl
  }

   getAll(): Observable<BlindEntry[]> {
    return this.http.get<BlindEntry[]>(`${this.apiUrl}/blinds/get`, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${User.getAccessToken()}`
    })
  }).pipe(catchError((error: any) => { throw this.handleError(error) }));
   }

  add(name: string): Observable<BlindEntry> {
    return this.http.post<BlindEntry>(`${this.apiUrl}/blinds/create`, {
      title: name
    }, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${User.getAccessToken()}`
    })
  }).pipe(catchError((error: any) => { throw this.handleError(error) }));
  }

  getById(id: string): Observable<BlindEntry | undefined> {
    return this.getAll().pipe(
      map((blinds: BlindEntry[]) => blinds.find(blind => blind.id === id)),
      catchError((error: any) => { throw this.handleError(error); })
    );
  }

  remove(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/blinds/delete/` + id, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${User.getAccessToken()}`
    })
  }).pipe(catchError((error: any) => { throw this.handleError(error) }));
  }

  addCollaborator(username: string, id: number) {
    return this.http.post<boolean>(`${this.apiUrl}/blinds/addCollaborator`,
      {
        id: id,
        username: username
      }
      ,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${User.getAccessToken()}`
      })
    });

  } 

  removeCollaborator(username: string, id: number) {
    return this.http.delete<boolean>(`${this.apiUrl}/blinds/removeCollaborator`, 
    {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${User.getAccessToken()}`
      }),
      body: {
        id: id,
        username: username
      }
    }).pipe(catchError((error: any) => { throw this.handleError(error) }));

  }

  downloadTree(blindId: string) {
    const url = `${this.apiUrl}/youtube/${blindId}/download`;
    window.open(url, '_blank');
  }

  private handleError(error: any): any {
    return error;
  }
}
