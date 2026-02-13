import { Component, OnInit, inject } from "@angular/core";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { RouterModule } from "@angular/router";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";

@Component({
  selector: "app-missing-benchmarks",
  imports: [BreadcrumbsComponent, LucideAngularModule, RouterModule],
  templateUrl: "./missing-benchmarks.component.html",
  styleUrl: "./missing-benchmarks.component.scss",
})
export class MissingBenchmarksComponent implements OnInit {
  private keeperAPI = inject(KeeperAPIService);
  private SEOHandler = inject(SeoHandlerService);

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Debug", url: "/debug" },
  ];

  vendors: any[] = [];
  allServers: any[] = [];
  expandedVendors: Set<string> = new Set();

  toggleVendor(vendorId: string) {
    if (this.expandedVendors.has(vendorId)) {
      this.expandedVendors.delete(vendorId);
    } else {
      this.expandedVendors.add(vendorId);
    }
  }

  isVendorExpanded(vendorId: string): boolean {
    return this.expandedVendors.has(vendorId);
  }

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Server Benchmark Staticstics",
      "This page shows all servers that are missing benchmarks",
      "missing benchmarks, benchmark status",
    );

    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.searchServers({
        limit: 10000,
        only_active: false,
        order_by: "vcpus",
      }),
    ]).then(([vendors, allServers]) => {
      this.vendors = vendors.body.map((vendor: any) => {
        return {
          name: vendor.name,
          id: vendor.vendor_id,
          servers: 0,
          active_servers: 0,
          missing: 0,
          evaluated: 0,
          evaluated_active_servers: 0,
          percentage: 0,
          missing_servers: [],
          inactive_count: 0,
          technical_issues_count: 0,
        };
      });
      this.allServers = allServers.body;

      this.allServers.forEach((server: any) => {
        let vendor = this.vendors.find(
          (vendor: any) => vendor.id === server.vendor.vendor_id,
        );
        vendor.servers++;

        if (server.status === "active" && server.min_price) {
          vendor.active_servers++;
        }

        if (server.score) {
          vendor.evaluated++;
          if (server.status === "active" && server.min_price) {
            vendor.evaluated_active_servers++;
          }
        } else {
          if (server.status === "inactive") {
            server.reason =
              "This server is currently inactive and not available for benchmarking.";
            vendor.inactive_count++;
          } else if (!server.min_price) {
            server.reason =
              "This server is very likely not GA (General Availability), as we have not found public pricing information.";
            vendor.inactive_count++;
          } else {
            server.reason =
              "We have run into a quota limit while running this server, or faced other technical issues.";
            vendor.technical_issues_count++;
          }
          vendor.missing++;
          vendor.missing_servers.push(server);
        }
      });

      this.vendors.forEach((vendor: any) => {
        if (vendor.missing_servers.length > 0) {
          vendor.missing_servers.sort((a: any, b: any) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        }
      });
    });
  }
}
