import { Component, OnInit } from '@angular/core';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, TableDatacenterTableDatacenterGetData } from '../../../../sdk/data-contracts';
import { LucideAngularModule } from 'lucide-angular';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, CommonModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent implements OnInit {
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


  datacenters: TableDatacenterTableDatacenterGetData = [];
  vendors: any[] = [];

  orderBy: string | null = null;
  orderDir: OrderDir | null = null;

  constructor(
    private SEOHandler: SeoHandlerService,
    private API: KeeperAPIService,
    private router: Router
  ) { }

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags('Vendors - Spare Cores', 'List of all vendors', 'AWS, Google Cloud, Hetzner');

    this.API.getVendors().then(vendors => {
      this.vendors = vendors.body;
      for (let i = 0; i < this.vendors.length; i++) {
        this.vendors[i].datacenters = 0;
      }
      this.API.getDatacenters().then(datacenters => {
        this.datacenters = datacenters.body;
        // count datacenters per vendor
        for (let i = 0; i < this.datacenters.length; i++) {
          const vendor = this.vendors.find((v: any) => v.vendor_id === this.datacenters[i].vendor_id);
          vendor.datacenters++;
        }
      });
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

    if(this.orderBy === 'datacenter') {
      this.datacenters.sort((a, b) => {
        return this.orderDir === OrderDir.Desc ? a.display_name.localeCompare(b.display_name) : b.display_name.localeCompare(a.display_name);
      });
    }
    else if(this.orderBy === 'vendor') {
      this.datacenters.sort((a, b) => {
        return this.orderDir === OrderDir.Desc ? this.getVendorName(a.vendor_id).localeCompare(this.getVendorName(b.vendor_id)) : this.getVendorName(b.vendor_id).localeCompare(this.getVendorName(a.vendor_id));
      });
    } else if(this.orderBy === 'country') {
      this.datacenters.sort((a, b) => {
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
    this.router.navigateByUrl(`/servers?vendor=${item.vendor_id}`);
  }
}
