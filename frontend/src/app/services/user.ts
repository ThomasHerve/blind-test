import { Injectable } from '@angular/core';
import { RuntimeEnv } from './runtime-env';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserDTO } from '../shared/DTO/userDTO';
import { catchError, Observable, tap } from 'rxjs';
import { User } from '../shared/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private envService: RuntimeEnv, private http: HttpClient) { }

  registerUser(user: UserDTO, handleError: Function): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.envService.apiUrl}/users/create`, user).pipe(
      catchError((error: any) => { handleError(error); throw this.handleError(error) })
    );
  }

  loginUser(user: UserDTO, handleError: Function): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.envService.apiUrl}/users/login`, user).pipe(
      catchError((error: any) => { handleError(error); throw this.handleError(error) })
    );
  }

  tryUserProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.envService.apiUrl}/users/profile`).pipe(
      catchError(() => { throw User.removeUser() })
    );
  }

  getApi(): string {
    return this.envService.apiUrl;
  }

  private handleError(error: any): any {
    return error;
  }

  /*
  getData() {
    const url = this.envService.apiUrl + '/data';
    return this.http.get(url);
  }*/

}
