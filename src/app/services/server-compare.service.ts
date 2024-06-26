import { Injectable } from '@angular/core';
import { ServerPKs } from '../../../sdk/data-contracts';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerCompareService {

  selectedForCompare: ServerPKs[] = [];
  public selectionChanged: Subject<ServerPKs[]> = new Subject();

  constructor(private router: Router) { }

  toggleCompare(event: boolean, server: ServerPKs| any) {
    if(event) {
      if(this.selectedForCompare.findIndex((item) => item.vendor_id === server.vendor_id && item.server_id === server.server_id) === -1) {
        this.selectedForCompare.push(server);
      }
    } else {
      this.selectedForCompare = this.selectedForCompare.filter((item) => item.vendor_id !== server.vendor_id || item.server_id !== server.server_id);
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
    return this.selectedForCompare.findIndex((item) => item.vendor_id === server.vendor_id && item.server_id === server.server_id) !== -1;
  }

  openCompare() {
    const selectedServers = this.selectedForCompare;

    if(selectedServers.length < 2) {
      alert('Please select at least two servers to compare');
      return;
    }

    const serverIds = selectedServers.map((server) => {
      return {vendor: server.vendor_id, server: server.api_reference}
    });

    // encode atob to avoid issues with special characters
    const encoded = btoa(JSON.stringify(serverIds));

    this.router.navigateByUrl('/compare?instances=' + encoded);
  }
}
