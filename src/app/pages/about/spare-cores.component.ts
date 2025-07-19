import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { isPlatformBrowser } from '@angular/common';
import { NeetoCalService } from '../../services/neeto-cal.service';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-about-spare-cores',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './spare-cores.component.html',
  styleUrl: './spare-cores.component.scss'
})
export class AboutSpareCoresComponent implements OnInit, AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private SEOHandler: SeoHandlerService,
              private neetoCalService: NeetoCalService) { }
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'About'
    },
    {
      name: 'Spare Cores',
      url: '/about/spare-cores'
    }
  ];
  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
       'About Spare Cores',
       'Spare Cores Products and Services overview.',
       'sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/landing_image.png');
    }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.neetoCalService.initialize();
    }
  }
}
