import { CommonModule } from "@angular/common";
import { Component, inject, viewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { ServerCompareService } from "../../services/server-compare.service";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";

@Component({
  selector: "app-header",
  imports: [
    LucideAngularModule,
    RouterLink,
    CommonModule,
    FlowbiteDropdownDirective,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  private serverCompare = inject(ServerCompareService);

  menuDropdown = viewChild<FlowbiteDropdownDirective>("menuDropdown");
  aboutDropdown = viewChild<FlowbiteDropdownDirective>("aboutDropdown");
  compareDropdown = viewChild<FlowbiteDropdownDirective>("compareDropdown");
  navigatorDropdown = viewChild<FlowbiteDropdownDirective>("navigatorDropdown");

  closeMenu() {
    this.menuDropdown()?.hide();
  }

  closeCompare() {
    this.compareDropdown()?.hide();
  }

  closeNavigator() {
    this.navigatorDropdown()?.hide();
  }

  closeAbout() {
    this.aboutDropdown()?.hide();
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
