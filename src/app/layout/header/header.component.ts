import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, inject, signal, viewChild } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Button } from "../../components/button/button";
import {
  LucideActivity,
  LucideArrowUpDown,
  LucideBookText,
  LucideBot,
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
import { Auth } from "../../services/auth/auth";

@Component({
  selector: "sc-header",
  imports: [
    Button,
    LucideActivity,
    LucideArrowUpDown,
    LucideBookText,
    LucideBot,
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
  private router = inject(Router);
  private serverCompare = inject(ServerCompareService);
  protected readonly auth = inject(Auth);
  protected readonly authDropdownOpen = signal(false);

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

  toggleAuthDropdown(): void {
    this.authDropdownOpen.update((open) => !open);
  }

  closeAuthDropdown(): void {
    this.authDropdownOpen.set(false);
  }

  signIn(): void {
    this.closeMenu();
    this.auth.signIn();
  }

  signUp(): void {
    this.closeMenu();
    this.auth.signUp();
  }

  async signOut(): Promise<void> {
    this.closeAuthDropdown();
    this.closeMenu();
    await this.auth.signOut();
    await this.router.navigate(["/"]);
  }

  openProfile(): void {
    this.auth.openUserProfile();
    this.closeAuthDropdown();
  }

  compareCount(): number {
    return this.serverCompare.compareCount();
  }

  isOnComparePage(): boolean {
    const path = this.router.url.split("?")[0].split("#")[0];
    return path.startsWith("/compare");
  }

  compareServers() {
    this.serverCompare.openCompare();
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
