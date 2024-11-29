import { Injectable } from '@angular/core';
import { ServerPKs, ServerPriceWithPKs } from '../../../sdk/data-contracts';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface ServerCompare {
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

  toggleCompare(event: boolean, server: ServerCompare) {
    if(event) {
      if(this.selectedForCompare.findIndex((item) =>
          item.vendor === server.vendor && item.server === server.server && (!server.zone || item.zone === server.zone)) === -1) {
        this.selectedForCompare.push(server);
      }
    } else {
      this.selectedForCompare = this.selectedForCompare.filter((item) =>
        item.vendor !== server.vendor || item.server !== server.server && (!server.zone || item.zone === server.zone));
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
