import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit{

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {

    if(isPlatformBrowser(this.platformId)) {
      this.authService.loginCodeFlow().then(() => {
        const url = sessionStorage.getItem('prelogin_url') || '/';
        sessionStorage.removeItem('prelogin_url');
        this.router.navigateByUrl(url);
      });
    }

  }

}
