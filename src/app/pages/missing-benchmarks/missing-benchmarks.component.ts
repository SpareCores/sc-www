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
  activeServers: any[] = [];

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Server Benchmark Staticstics",
      "This page shows all servers that are missing benchmarks",
      "missing benchmarks, benchmark status",
    );

    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.searchServers({ limit: 10000, only_active: false, order_by: 'vcpus' }),
      this.keeperAPI.searchServers({ limit: 10000 }),
    ]).then(([vendors, allServers, activeServers]) => {
      this.vendors = vendors.body.map((vendor: any) => {
        return {
          name: vendor.name,
          id: vendor.vendor_id,
          servers: 0,
          active_servers: 0,
          missing: 0,
          evaluated: 0,
          percentage: 0,
          missing_servers: [],
        };
      });
      this.allServers = allServers.body;
      this.activeServers = activeServers.body;

      // Process all servers for identified servers count
      this.allServers.forEach((server: any) => {
        let vendor = this.vendors.find(
          (vendor: any) => vendor.id === server.vendor.vendor_id,
        );
        vendor.servers++;
      });

      // Process active servers for active count, evaluated, and missing
      this.activeServers.forEach((server: any) => {
        let vendor = this.vendors.find(
          (vendor: any) => vendor.id === server.vendor.vendor_id,
        );
        vendor.active_servers++;
        if (server.score) {
          vendor.evaluated++;
        } else {
          server.reason = server.price
            ? "We have run into a quota limit while running this server, or faced other technical issues."
            : "This server is very likely not be GA (General Availability), as we have not found public pricing information.";
          vendor.missing++;
          vendor.missing_servers.push(server);
        }
      });

      this.vendors.forEach((vendor: any) => {
        if (vendor.active_servers > 0) {
          vendor.percentage = parseFloat(
            ((vendor.missing / vendor.active_servers) * 100).toFixed(2),
          );
        }
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
