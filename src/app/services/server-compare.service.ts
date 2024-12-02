import { Injectable } from '@angular/core';
import { ServerPKs } from '../../../sdk/data-contracts';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface ServerCompare {
  display_name: string;
  vendor: string;
  server: string;
  zones: string[];
}

export interface ServerCompareItem {
  display_name: string;
  vendor: string;
  server: string;
  zone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerCompareService {

  selectedForCompare: ServerCompare[] = [];
  public selectionChanged: Subject<ServerCompare[]> = new Subject();

  constructor(private router: Router) { }

  toggleCompare(event: boolean, server: ServerCompareItem) {
    if(event) {
      let existing = this.selectedForCompare.find((item) => item.vendor === server.vendor && item.server === server.server);
      if(existing) {
        if(server.zone && !existing.zones.includes(server.zone)) {
          existing.zones.push(server.zone);
        } else {
          this.selectedForCompare.push(
            {
              display_name: server.display_name,
              vendor: server.vendor,
              server: server.server,
              zones: server.zone ? [server.zone] : []
            }
          );
        }

      }
    } else {
      // removing the whole server
      if(!server.zone) {
        this.selectedForCompare = this.selectedForCompare.filter((item) =>
          item.vendor !== server.vendor || item.server !== server.server);
      } else {
        // removing a zone
        let existing = this.selectedForCompare.find((item) => item.vendor === server.vendor && item.server === server.server);
        if(existing) {
          // remove if no zones left
          existing.zones = existing.zones.filter((zone) => zone !== server.zone);
          if(existing.zones.length === 0) {
            this.selectedForCompare = this.selectedForCompare.filter((item) =>
              item.vendor !== server.vendor || item.server !== server.server);
          }
        }
      }
    }
    this.selectionChanged.next(this.selectedForCompare);
  }

  compareCount(): number {
    return this.selectedForCompare?.length;
  }

  clearCompare() {
    this.selectedForCompare = [];
    this.selectionChanged.next(this.selectedForCompare);
  }

  isSelected(server: ServerPKs) {
    return this.selectedForCompare.findIndex((item) => item.vendor === server.vendor_id && item.server === server.api_reference) !== -1;
  }

  openCompare() {
    const selectedServers = this.selectedForCompare;

    if(selectedServers.length < 2) {
      alert('Please select at least two servers to compare');
      return;
    }

    // encode atob to avoid issues with special characters
    const encoded = btoa(JSON.stringify(selectedServers));

    this.router.navigateByUrl('/compare?instances=' + encoded);
  }
}
