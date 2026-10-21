import { OverlayContainer } from "@angular/cdk/overlay";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PageOverlayContainer extends OverlayContainer {
  protected override _createContainer(): void {
    super._createContainer();
    this._containerElement?.classList.add("sc-page-overlay-container");
  }
}
