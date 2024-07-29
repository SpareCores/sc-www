import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, TableRegionTableRegionGetData } from '../../../../sdk/data-contracts';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

declare let Datamap: any;

const colors = [
  '#3B82F6',
  '#F87171',
  '#FBBF24',
  '#F472B6',
  '#34D399',
  '#E5E7EB',
  '#38BDF8',
  '#FACC15',
  '#F87171',
  '#A3E635',
  '#818CF8',
  '#94A3B8'
];

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [BreadcrumbsComponent, CountryIdtoNamePipe, FormsModule, CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './regions.component.html',
  styleUrl: './regions.component.scss'
})
export class RegionsComponent implements OnInit {

  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'Regions',
      url: '/regions'
    }
  ];

  regions: TableRegionTableRegionGetData = [];

  vendors: any[] = [];

  orderBy: string | null = null;
  orderDir: OrderDir | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private SEOHandler: SeoHandlerService,
    private API: KeeperAPIService,
    private router: Router
  ) { }

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags('Regions - Spare Cores', 'List of all regions', 'AWS regions, Google Cloud regions');

    this.API.getRegions().then(regions => {
      this.regions = regions.body;
    });

    this.API.getVendors().then(vendors => {
      this.vendors = vendors.body;
    });

    if (isPlatformBrowser(this.platformId)) {

      Promise.all([
        this.API.getRegions(),
        this.API.getVendors()
      ]).then(([regions, vendors]) => {
        this.regions = regions.body;
        this.vendors = vendors.body;

        let element = document.getElementById("datamapdiv");

        let fills: any = {
          defaultFill: '#ABDDA4'
        };

        this.vendors.forEach((vendor, index) => {
          fills[vendor.vendor_id] = colors[index % colors.length];
        });

        let bubble_map = new Datamap({
          element: element,
          geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false
          },
          fills: fills
        });

        bubble_map.bubbles(
          this.regions.map(region => {
            return {
              name: `${region.display_name} (${this.getVendorName(region.vendor_id)}) `,
              radius: 5,
              country: region.country_id,
              significance: region.display_name,
              date: '2021-01-01',
              fillKey: region.vendor_id,
              latitude: region.lat,
              longitude: region.lon
          }})
        );
      });
    }

  }

  getVendorName(vendorId: string): string {
    const vendor = this.vendors.find(vendor => vendor.vendor_id === vendorId);
    return vendor ? vendor.name : '';
  }

  toggleOrdering(column: string) {

    if(this.orderBy === column) {
      if(this.orderDir === OrderDir.Desc) {
        this.orderDir = OrderDir.Asc;
      }
      else {
        this.orderDir = null;
        this.orderBy = null;
      }
    } else {
      this.orderBy = column;
      this.orderDir = OrderDir.Desc;
    }

    if(this.orderBy === 'region') {
      this.regions.sort((a, b) => {
        return this.orderDir === OrderDir.Desc ? a.display_name.localeCompare(b.display_name) : b.display_name.localeCompare(a.display_name);
      });
    }
    else if(this.orderBy === 'vendor') {
      this.regions.sort((a, b) => {
        return this.orderDir === OrderDir.Desc ? this.getVendorName(a.vendor_id).localeCompare(this.getVendorName(b.vendor_id)) : this.getVendorName(b.vendor_id).localeCompare(this.getVendorName(a.vendor_id));
      });
    } else if(this.orderBy === 'country') {
      this.regions.sort((a, b) => {
        return this.orderDir === OrderDir.Desc ? a.country_id.localeCompare(b.country_id) : b.country_id.localeCompare(a.country_id);
      });
    }
  }

  getOrderingIcon(column: string) {

    if(this.orderBy === column) {
      return this.orderDir === OrderDir.Desc ? 'arrow-down-wide-narrow' : 'arrow-down-narrow-wide';
    }
    return null;
  }

  openLink(item: any) {
    this.router.navigateByUrl(`/servers?regions=${item.region_id}`);
  }

}
