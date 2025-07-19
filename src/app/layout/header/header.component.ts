import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ServerCompareService } from '../../services/server-compare.service';
import { DropdownManagerService } from '../../services/dropdown-manager.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  dropdownMenu: any;
  dropdownAbout: any;
  dropdownCompare: any;
  dropdownPrices: any;
  dropdownServers: any;
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

      this.dropdownManager.initDropdown('about_button', 'about_options').then((dropdown) => {
        this.dropdownAbout = dropdown;
      });

      this.dropdownManager.initDropdown('compare_button', 'compare_options').then((dropdown) => {
        this.dropdownCompare = dropdown;
      });

      this.dropdownManager.initDropdown('prices_button', 'prices_options').then((dropdown) => {
        this.dropdownPrices = dropdown;
      });

      this.dropdownManager.initDropdown('servers_button', 'servers_options').then((dropdown) => {
        this.dropdownServers = dropdown;
      });
    }

  }

  closeMenu() {
    this.dropdownMenu?.hide();
  }

  closeCompare() {
    this.dropdownCompare?.hide();
  }

  closePrices() {
    this.dropdownPrices?.hide();
  }

  closeServers() {
    this.dropdownServers?.hide();
  }

  closeAbout() {
    this.dropdownAbout?.hide();
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
