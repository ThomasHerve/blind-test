import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RuntimeEnv {

private env = (window as any).__env;
  get apiUrl(): string {
    return this.env?.apiUrl;// || 'http://localhost:3000';
  }

}
