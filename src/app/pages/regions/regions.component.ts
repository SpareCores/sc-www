import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, TableRegionTableRegionGetData } from '../../../../sdk/data-contracts';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

declare let Datamap: any;

const SCRIPT_PATH = 'assets/datamaps/d3.min.js';
const SCRIPT_PATH2 = 'assets/datamaps/topojson.js';
const SCRIPT_PATH3 = 'assets/datamaps/datamaps.world.min.js';

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

  bubble_map: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private SEOHandler: SeoHandlerService,
    private renderer: Renderer2,
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
        const scriptElement = this.loadJsScript(this.renderer, SCRIPT_PATH);

        scriptElement.onload = () => {
          const scriptElement2 = this.loadJsScript(this.renderer, SCRIPT_PATH2);
          scriptElement2.onload = () => {
            const scriptElement3 = this.loadJsScript(this.renderer, SCRIPT_PATH3);
            scriptElement3.onload = () => {
              Promise.all([
                this.API.getRegions(),
                this.API.getVendors()
              ]).then(([regions, vendors]) => {
                this.regions = regions.body;
                this.vendors = vendors.body;

                this.vendors = this.vendors.map((region, index) => {
                  return {selected: true, color: colors[index % colors.length],  ...region}
                });

                let element = document.getElementById("datamapdiv");

                let fills: any = {
                  defaultFill: '#06263a'
                };

                this.vendors.forEach((vendor, index) => {
                  fills[vendor.vendor_id] = colors[index % colors.length];
                });

                this.bubble_map = new Datamap({
                  element: element,
                  geographyConfig: {
                    popupOnHover: false,
                    highlightOnHover: false
                  },
                  bubblesConfig: {
                    fillOpacity: 1,
                    borderOpacity: 0,
                    highlightFillColor: '#34d399',
                    highlightBorderOpacity: 0,
                  },
                  fills: fills
                });

                this.generateBubbles();

              });

            };
          };
        };
    }
  }

   /**
  * Append the JS tag to the Document Body.
  * @param renderer The Angular Renderer
  * @param src The path to the script
  * @returns the script element
  */
   public loadJsScript(renderer: Renderer2, src: string): HTMLScriptElement {
    const script = renderer.createElement('script');
    script.src = src;
    renderer.appendChild(this.document.head, script);
    return script;
  }

  generateBubbles() {
    this.bubble_map.bubbles(
      this.regions
        .filter(region => this.isVendorSelected(region.vendor_id))
        .map(region => {
        return {
          name: region.name,
          display_name: `${region.display_name}`,
          region: region.region_id,
          vendor: region.vendor_id,
          founding_year: region.founding_year,
          green_energy: region.green_energy,
          location: `${region.lat},${region.lon}`,
          radius: 5,
          country: region.country_id,
          fillKey: region.vendor_id,
          latitude: region.lat,
          longitude: region.lon
      }}),
      {
        popupTemplate: this.popupTemplate.bind(this)
      }
    );
  }

  popupTemplate(geo: any, data: any) {
    let countryName = new CountryIdtoNamePipe().transform(data.country);
    let html = `<div class="hoverinfo"> <ul>`;
    html += `<li><b>Vendor</b>: ${this.getVendorName(data.vendor)}</li>`;
    html += `<li><b>Region ID</b>: ${data.region}</li>`;
    html += `<li><b>Region name</b>: ${data.name}</li>`;
    html += `<li><b>Country</b>: ${countryName}</li>`;
    html += `<li><b>Location</b>: ${data.display_name}</li>`;
    if(data.founding_year) {
      html += `<li><b>Founding year</b>: ${data.founding_year}</li>`;
    }
    html += `<li><b>100% green energy</b>: ${data.green_energy ? '✅' : '🔴'}</li>`;
    html += `</ul> </div>`;
    return html;
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
    this.router.navigateByUrl(`/server_prices?regions=${item.region_id}`);
  }

  toggleVendorSelected(vendorId: string) {
    this.vendors.find(vendor => vendor.vendor_id === vendorId).selected = !this.vendors.find(vendor => vendor.vendor_id === vendorId).selected;
    this.generateBubbles();
  }

  isVendorSelected(vendorId: string) {
    return this.vendors?.find(vendor => vendor.vendor_id === vendorId)?.selected;
  }

  getColorStyle(vendor: any) {
    return `background-color: ${vendor.color || '#06263a'}`;
  }

}
