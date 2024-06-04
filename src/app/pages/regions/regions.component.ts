import { Component, OnInit } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, TableRegionTableRegionGetData } from '../../../../sdk/data-contracts';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

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
