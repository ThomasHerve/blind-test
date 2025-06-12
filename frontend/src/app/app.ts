import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { User } from './shared/user/user';
import { UserService } from './services/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, User],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  
  protected title = 'frontend';

  constructor(private userService: UserService) {
    User.cacheLoadUser();
  }

    ngOnInit() {
    if (User.user)
      this.userService.tryUserProfile();

  }

}
