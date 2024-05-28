import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {ngSkipHydration: 'true'},
})
export class HeaderComponent {

  constructor(
    private authService: AuthenticationService
  ) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  login() {
    this.authService.authenticate();
  }

  logout() {
    this.authService.signout();
  }

}
