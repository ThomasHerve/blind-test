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

  /** Récupère toutes les entrées depuis le localStorage (ou renvoie [] si rien). */
  /*
  getAll(): BlindEntry[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as BlindEntry[];
    } catch {
      return [];
    }
  }
    */
   getAll(): Observable<BlindEntry[]> {
    return this.http.get<BlindEntry[]>(`${this.apiUrl}/blinds/get`, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${User.getAccessToken()}`
    })
  }).pipe(catchError((error: any) => { throw this.handleError(error) }));
   }

  /** Ajoute une nouvelle entrée (et la persiste). */
  /*
  add(name: string): BlindEntry {
    const entries = this.getAll();
    const newEntry: BlindEntry = {
      id: Date.now().toString(),  // utilisation du timestamp comme id simple
      name: name.trim()
    };
    entries.push(newEntry);
    this.saveAll(entries);
    return newEntry;
  }
  */

  add(name: string): Observable<BlindEntry> {
    return this.http.post<BlindEntry>(`${this.apiUrl}/blinds/create`, {
      title: name
    }, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${User.getAccessToken()}`
    })
  }).pipe(catchError((error: any) => { throw this.handleError(error) }));
  }

  /** Met à jour la liste complète dans le localStorage. */
  /*
  private saveAll(entries: BlindEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }*/

  /** (Optionnel pour plus tard) Récupérer un blind par id. */
  
  getById(id: string): Observable<BlindEntry | undefined> {
    return this.getAll().pipe(
      map((blinds: BlindEntry[]) => blinds.find(blind => blind.id === id)),
      catchError((error: any) => { throw this.handleError(error); })
    );
  }

  /** (Optionnel pour plus tard) Supprimer une entrée. */
  /*
  remove(id: string): void {
    const filtered = this.getAll().filter(e => e.id !== id);
    this.saveAll(filtered);
  }*/

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

  private handleError(error: any): any {
    return error;
  }
}
