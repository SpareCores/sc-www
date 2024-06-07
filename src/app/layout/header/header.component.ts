import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown, DropdownOptions, initFlowbite } from 'flowbite';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  dropdownMenu: any;

  options: DropdownOptions = {
    placement: 'bottom',
    triggerType: 'click',
    offsetSkidding: 0,
    offsetDistance: 10,
    delay: 300
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
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
      }, 150);
    }

  }

  closeMenu() {
    this.dropdownMenu?.hide();
  }

}
