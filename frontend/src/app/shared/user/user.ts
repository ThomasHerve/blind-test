import { ChangeDetectorRef, Component } from '@angular/core';
import { UserDTO } from '../DTO/userDTO';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialog } from './login-dialog/login-dialog';

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
      //App.presentOkToast("Welcome " + value.username)
    }
    else {
      localStorage.removeItem('user')
      //AppComponent.presentOkToast("Successfully logged out")
    }
  }
  get user(): UserDTO | null {
    return User.user;
  }
  set user(value: UserDTO | null) {
    User.user = value
  }


  constructor(private router: Router, private userService: UserService, private dialog: MatDialog, private cd: ChangeDetectorRef) {
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
          width: '280px',
          data: { name: '', password: '' } // on peut passer des données initiales si besoin
        });
    
        dialogRef.afterClosed().subscribe(result => {
            // TODO result.name result.password
            this.userService.loginUser(new UserDTO({ username: result.name, password: result.password })).subscribe((value)=>{
              this.user = value
              this.cd.detectChanges();
            })
        });
  }

  static cacheLoadUser() {
    const json = localStorage.getItem('user');
    if (json) {
      const user = JSON.parse(json);
      User._user = user
    }
  }

}
