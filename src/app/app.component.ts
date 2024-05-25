import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, NavigationError, NavigationStart, Router, Event, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { register } from 'swiper/element/bundle';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sc-www';

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private analytics: AnalyticsService,
    private metaTagService: Meta) {

      router.events.subscribe( (event: Event) => {

        if (event instanceof NavigationStart) {
            // Show loading indicator
        }

        if (event instanceof NavigationEnd) {
          let url = 'https://sparecores.com';
          if(event?.urlAfterRedirects?.length > 1) {
            url += event?.urlAfterRedirects.split('?')[0];
          }
          this.analytics.trackEvent('pageView', {});
          this.updateCanonical(url.toLowerCase());
        }

        if (event instanceof NavigationError) {
            // Hide loading indicator

            // Present error to user
        }
    });
  }

  ngOnInit() {
    register();
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.analytics.initializeTracking();
    }
  }

  updateCanonical(url: string) {
    const canonicalUrl = url;
    const head = this.document.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`) || null;
    if (element == null) {
      element = this.document.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', canonicalUrl);

    this.metaTagService.updateTag({ property: 'og:url', content: canonicalUrl }, "property='og:url'");
  }
}
