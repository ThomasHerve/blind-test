import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RuntimeEnv {

private env = (window as any).__env;
  get apiUrl(): string {
    console.log("1")
    console.log(this.env)
    console.log("2")
    return this.env?.apiUrl;// || 'http://localhost:3000';
  }

}
