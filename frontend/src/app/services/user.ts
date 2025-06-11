import { Injectable } from '@angular/core';
import { RuntimeEnv } from './runtime-env';
import { HttpClient } from '@angular/common/http';
import { UserDTO } from '../shared/DTO/userDTO';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class User {

  constructor(private envService: RuntimeEnv, private http: HttpClient) { }

  registerUser(user: UserDTO): Observable<any> {
    return this.http.post(`${this.envService.apiUrl}/users/create`, user).pipe(
      catchError((error: any) => { throw this.handleError(error) })
    );
  }

  loginUser(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.envService.apiUrl}/users/login`, user).pipe(
      catchError((error: any) => { throw this.handleError(error) })
    );
  }

  getApi(): string {
    return this.envService.apiUrl;
  }

  private handleError(error: any): any {
    console.error(error.message);
    return error;
  }

  /*
  getData() {
    const url = this.envService.apiUrl + '/data';
    return this.http.get(url);
  }*/

}
