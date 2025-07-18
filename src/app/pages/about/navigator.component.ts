import { Component } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-about-navigator',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './navigator.component.html',
  styleUrl: './navigator.component.scss'
})
export class AboutNavigatorComponent {
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'About'
    },
    {
      name: 'Navigator',
      url: '/about/navigator'
    }
  ];
}
