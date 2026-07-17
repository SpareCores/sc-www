import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, inject, viewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  LucideActivity,
  LucideArrowUpDown,
  LucideBookText,
  LucideBot,
  LucideCalendarDays,
  LucideDatabase,
  LucideDollarSign,
  LucideGauge,
  LucideHandshake,
  LucideHeartHandshake,
  LucideHouse,
  LucideHotel,
  LucideInfo,
  LucideMenu,
  LucideNotebookText,
  LucidePalette,
  LucidePcCase,
  LucideProjector,
  LucideScale,
  LucideShieldCog,
  LucideShipWheel,
  LucideTarget,
  LucideTrash,
} from "@lucide/angular";
import { ServerCompareService } from "../../services/server-compare.service";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";

@Component({
  selector: "app-header",
  imports: [
    LucideActivity,
    LucideArrowUpDown,
    LucideBookText,
    LucideBot,
    LucideCalendarDays,
    LucideDatabase,
    LucideDollarSign,
    LucideGauge,
    LucideHandshake,
    LucideHeartHandshake,
    LucideHouse,
    LucideHotel,
    LucideInfo,
    LucideMenu,
    LucideNotebookText,
    LucidePalette,
    LucidePcCase,
    LucideProjector,
    LucideScale,
    LucideShieldCog,
    LucideShipWheel,
    LucideTarget,
    LucideTrash,
    RouterLink,
    CommonModule,
    FlowbiteDropdownDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
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

  getServersForCompare() {
    return this.serverCompare.selectedForCompare;
  }

  isBaselineServer(server: { vendor: string; server: string }): boolean {
    return this.serverCompare.isBaselineServer(server);
  }

  toggleBaselineServer(server: { vendor: string; server: string }): void {
    this.serverCompare.toggleBaselineServer(server);
  }

  removeFromCompare(server: any) {
    this.serverCompare.toggleCompare(false, server);
  }

  dropComparedServer(event: CdkDragDrop<unknown>) {
    this.serverCompare.reorderSelectedForCompare(
      event.previousIndex,
      event.currentIndex,
    );
  }

  setCompareDragCursor(isDragging: boolean) {
    document.body.style.cursor = isDragging ? "grabbing" : "";
  }
}
