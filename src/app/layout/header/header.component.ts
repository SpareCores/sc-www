import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown, DropdownOptions, initFlowbite } from 'flowbite';
import { LucideAngularModule } from 'lucide-angular';
import { ServerCompareService } from '../../services/server-compare.service';

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
    private serverCompare: ServerCompareService
  ) { }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        initFlowbite();
      }, 1000);

      const interval = setInterval(() => {
        const targetElAllocation: HTMLElement | null = document.getElementById('menu_options');
        const triggerElAllocation: HTMLElement | null = document.getElementById('menu_button');

        if(targetElAllocation && triggerElAllocation) {
          this.dropdownMenu = new Dropdown(
            targetElAllocation,
            triggerElAllocation,
            this.options,
            {
              id: 'menu_options',
              override: true
            }
          );
          this.dropdownMenu.init();
          clearInterval(interval);
        }

        const targetElAllocationCompare: HTMLElement | null = document.getElementById('compare_options');
        const triggerElAllocationCompare: HTMLElement | null = document.getElementById('compare_button');

        if(targetElAllocationCompare && triggerElAllocationCompare) {
          this.dropdownCompare = new Dropdown(
            targetElAllocationCompare,
            triggerElAllocationCompare,
            this.options,
            {
              id: 'compare_options',
              override: true
            }
          );
          this.dropdownCompare.init();
        }
      }, 150);
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
