import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown, DropdownOptions, initFlowbite } from 'flowbite';
import { LucideAngularModule } from 'lucide-angular';
import { ServerCompareService } from '../../services/server-compare.service';
import { DropdownManagerService } from '../../services/dropwdown-manager.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  dropdownMenu: any;
  dropdownCompare: any;

  options: DropdownOptions = {
    placement: 'bottom',
    triggerType: 'click',
    offsetSkidding: 0,
    offsetDistance: 10,
    delay: 300
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private serverCompare: ServerCompareService,
    private dropdownManager: DropdownManagerService
  ) { }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.dropdownManager.initDropdown('menu_button', 'menu_options').then((dropdown) => {
        this.dropdownMenu = dropdown;
      });

      this.dropdownManager.initDropdown('compare_button', 'compare_options').then((dropdown) => {
        this.dropdownCompare = dropdown;
      });
    }

  }

  closeMenu() {
    this.dropdownMenu?.hide();
  }

  closeCompare() {
    this.dropdownCompare?.hide();
  }

  compareCount(): number {
    return this.serverCompare.compareCount();
  }

  compareServers() {
    this.serverCompare.openCompare();
  }

  getServersForCompare() {
    return this.serverCompare.selectedForCompare;
  }

  removeFromCompare(event: any, server: any) {
    event.stopPropagation();
    this.serverCompare.toggleCompare(false, server);
  }

}
