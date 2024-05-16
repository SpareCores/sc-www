import { Component } from '@angular/core';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'Vendors',
      url: '/vendors'
    }
  ];

  constructor(
    private SEOHandler: SeoHandlerService,
  ) { }

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags('Vendors - Spare Cores', 'List of all vendors', 'AWS, Google Cloud, Hetzner');
  }
}
