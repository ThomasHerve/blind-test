import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { UserDTO } from '../DTO/userDTO';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialog } from './login-dialog/login-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user',
  imports: [MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User {
  private static instance: User;

  private static _user: UserDTO | null = null
  static get user(): UserDTO | null {
    return User._user;
  }
  static set user(value: UserDTO | null) {
    User._user = value

    if (value) {
      localStorage.setItem('user', JSON.stringify(value))
    }
    else {
      localStorage.removeItem('user')
    }
  }
  get user(): UserDTO | null {
    return User.user;
  }
  set user(value: UserDTO | null) {
    User.user = value
  }


  constructor(private router: Router, private userService: UserService, private dialog: MatDialog, private cd: ChangeDetectorRef, private snackBar: MatSnackBar) {
    User.instance = this;
  }

  ngOnInit() { }

  static removeUser() {
    this.user = null
  }

  logout() {
      // insert logout
      this.user = null
      this.router.navigateByUrl('')
      this.cd.detectChanges();
  }

  login() {
    const dialogRef = this.dialog.open(LoginDialog, {
          width: '380px',
          data: { name: '', password: '' } // on peut passer des données initiales si besoin
        });
    
        dialogRef.afterClosed().subscribe(result => {
            // TODO result.name result.password
            if(result) {
              if(result.create) {
                console.log(result)
                this.userService.registerUser(new UserDTO({ username: result.name, password: result.password, email: result.email }), this.handleError).subscribe((value)=>{
                  this.user = value
                  this.cd.detectChanges();
                })
              } else {
                this.userService.loginUser(new UserDTO({ username: result.name, password: result.password }), this.handleError).subscribe((value)=>{
                  this.user = value
                  this.cd.detectChanges();
                })
              }
            }
            
        });
  }

  handleError(error: any) {
    let error_message = error.error.message
    console.log(error_message)
    User.sendToastError(error_message)
  }


  static cacheLoadUser() {
    const json = localStorage.getItem('user');
    if (json) {
      const user = JSON.parse(json);
      User._user = user
    }
  }

  static sendToastSuccess(message: string) {
    this.instance.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      panelClass: ['snackbar-success']
    })
  }

  static sendToastError(message: string) {
    this.instance.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      panelClass: ['snackbar-error']
    })
  }

}
