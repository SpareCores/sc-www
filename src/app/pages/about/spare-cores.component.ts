import { Component } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-about-spare-cores',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './spare-cores.component.html',
  styleUrl: './spare-cores.component.scss'
})
export class AboutSpareCoresComponent {
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'About Us',
      url: '/about'
    }
  ];
}
