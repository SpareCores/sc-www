import { Component } from '@angular/core';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent {

  features: any[] = [
    {
      count: '8',
      text: 'vendors'
    },
    {
      count: '67',
      text: 'datacenters'
    },
    {
      count: '234',
      text: 'availability zones'
    },
    {
      count: '2494',
      text: 'server types'
    },
    {
      count: '121.312',
      text: 'price records'
    },
    {
      count: '2.5M',
      text: 'records updated daily'
    },

    {
      count: '36M',
      text: 'historical records'
    },
  ];

  gitHubComponents: any[] = [
    {
      component: 'SC Crawler',
      status: 'pre-alpha',
      repository: 'sc-crawler',
      description: 'Crawler for scraping server prices from various vendors'
    },
    {
      component: 'SC Crawler',
      status: 'pre-alpha',
      repository: 'sc-crawler',
      description: 'Crawler for scraping server prices from various vendors'
    },
    {
      component: 'SC Crawler',
      status: 'pre-alpha',
      repository: 'sc-crawler',
      description: 'Crawler for scraping server prices from various vendors'
    },
    {
      component: 'SC Crawler',
      status: 'pre-alpha',
      repository: 'sc-crawler',
      description: 'Crawler for scraping server prices from various vendors'
    }
  ];

}
