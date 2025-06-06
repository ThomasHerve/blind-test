import { Injectable } from '@angular/core';

export interface BlindEntry {
  id: string;    // identifiant unique (timestamp ou UUID)
  name: string;  // nom de l’entrée
}

@Injectable({
  providedIn: 'root'
})
export class BlindService {
  private storageKey = 'blindEntries';

  constructor() {}

  /** Récupère toutes les entrées depuis le localStorage (ou renvoie [] si rien). */
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

  /** Ajoute une nouvelle entrée (et la persiste). */
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

  /** Met à jour la liste complète dans le localStorage. */
  private saveAll(entries: BlindEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  /** (Optionnel pour plus tard) Récupérer un blind par id. */
  getById(id: string): BlindEntry | undefined {
    return this.getAll().find(e => e.id === id);
  }

  /** (Optionnel pour plus tard) Supprimer une entrée. */
  remove(id: string): void {
    const filtered = this.getAll().filter(e => e.id !== id);
    this.saveAll(filtered);
  }
}
