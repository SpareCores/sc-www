import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";

import { Component, inject, viewChild } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Button } from "../../components/button/button";
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
  LucideFolderBookmark,
  LucideInfo,
  LucideLogOut,
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
  LucideUser,
} from "@lucide/angular";
import { Analytics } from "../../services/analytics";
import { CompareSelection } from "../../services/compare-selection";
import { FlowbiteDropdown } from "../../directives/flowbite-dropdown";
import { AuthState } from "../../core/auth";

@Component({
  selector: "sc-header",
  imports: [
    Button,
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
    LucideFolderBookmark,
    LucideLogOut,
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
    LucideUser,
    RouterLink,
    FlowbiteDropdown,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
})
export class Header {
  private router = inject(Router);
  private serverCompare = inject(CompareSelection);
  private analytics = inject(Analytics);
  protected readonly auth = inject(AuthState);

  menuDropdown = viewChild<FlowbiteDropdown>("menuDropdown");
  aboutDropdown = viewChild<FlowbiteDropdown>("aboutDropdown");
  authDropdown = viewChild<FlowbiteDropdown>("authDropdown");
  compareDropdown = viewChild<FlowbiteDropdown>("compareDropdown");
  navigatorDropdown = viewChild<FlowbiteDropdown>("navigatorDropdown");

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

  closeAuth() {
    this.authDropdown()?.hide();
  }

  signIn(): void {
    this.analytics.trackEvent("auth login open", {});
    this.closeMenu();
    this.auth.signIn();
  }

  signUp(): void {
    this.analytics.trackEvent("auth register open", {});
    this.closeMenu();
    this.auth.signUp();
  }

  async signOut(): Promise<void> {
    this.analytics.trackEvent("auth sign out", {});
    this.closeAuth();
    this.closeMenu();
    await this.auth.signOut();
  }

  openProfile(): void {
    this.auth.openUserProfile();
    this.closeAuth();
  }

  compareCount(): number {
    return this.serverCompare.compareCount();
  }

  serverCompareCount(): number {
    return this.serverCompare.serverCompareCount();
  }

  databaseCompareCount(): number {
    return this.serverCompare.databaseCompareCount();
  }

  showCompareMenu(): boolean {
    return this.serverCompareCount() >= 2 || this.databaseCompareCount() >= 2;
  }

  isOnComparePage(): boolean {
    const path = this.router.url.split("?")[0].split("#")[0];
    return path.startsWith("/servers/compare");
  }

  isOnDatabaseComparePage(): boolean {
    const path = this.router.url.split("?")[0].split("#")[0];
    return path.startsWith("/databases/compare");
  }

  compareServers() {
    this.serverCompare.openCompare();
  }

  compareDatabases() {
    this.serverCompare.openDatabaseCompare();
  }

  getServersForCompare() {
    return this.serverCompare.selectedForCompare;
  }

  getDatabasesForCompare() {
    return this.serverCompare.selectedDatabases;
  }

  isBaselineServer(server: { vendor: string; server: string }): boolean {
    return this.serverCompare.isBaselineServer(server);
  }

  isBaselineDatabase(database: { vendor: string; database: string }): boolean {
    return this.serverCompare.isBaselineDatabase(database);
  }

  toggleBaselineServer(server: { vendor: string; server: string }): void {
    this.serverCompare.toggleBaselineServer(server);
  }

  toggleBaselineDatabase(database: { vendor: string; database: string }): void {
    this.serverCompare.toggleBaselineDatabase(database);
  }

  removeFromCompare(server: any) {
    this.serverCompare.toggleCompare(false, server);
  }

  removeDatabaseFromCompare(database: any) {
    this.serverCompare.toggleDatabaseCompare(false, database);
  }

  dropComparedServer(event: CdkDragDrop<unknown>) {
    this.serverCompare.reorderSelectedForCompare(
      event.previousIndex,
      event.currentIndex,
    );
  }

  dropComparedDatabase(event: CdkDragDrop<unknown>) {
    this.serverCompare.reorderSelectedDatabases(
      event.previousIndex,
      event.currentIndex,
    );
  }

  setCompareDragCursor(isDragging: boolean) {
    document.body.style.cursor = isDragging ? "grabbing" : "";
  }
}
