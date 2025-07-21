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
  dropdownNavigator: any;
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

      this.dropdownManager.initDropdown('navigator_button', 'navigator_options').then((dropdown) => {
        this.dropdownNavigator = dropdown;
      });
    }

  }

  closeMenu() {
    this.dropdownMenu?.hide();
  }

  closeCompare() {
    this.dropdownCompare?.hide();
  }

  closeNavigator() {
    this.dropdownNavigator?.hide();
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
