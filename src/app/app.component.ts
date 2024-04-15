import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sc-www';

  constructor(@Inject(PLATFORM_ID) private platformId: object,) {

  }

  ngOnInit() {
    register();
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }
}
