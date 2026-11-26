import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { ListingFloatingActions } from "./listing-floating-actions";

@Component({
  template: `
    <sc-listing-floating-actions
      [filterCount]="filterCount()"
      [compareActive]="compareActive()"
      (openFilters)="opened = opened + 1"
      (clearFilters)="cleared = cleared + 1"
    >
      @if (compareActive()) {
        <button id="compare" type="button">Compare</button>
      }
    </sc-listing-floating-actions>
  `,
  imports: [ListingFloatingActions],
})
class HostComponent {
  filterCount = signal(0);
  compareActive = signal(false);
  opened = 0;
  cleared = 0;
}

describe("ListingFloatingActions", () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function button(event: string): HTMLButtonElement | null {
    return element().querySelector(
      `sc-button[data-ph-capture-attribute-sc-event="${event}"] button`,
    );
  }

  it("should create", () => {
    expect(element().querySelector(".sc-floating-actions")).not.toBeNull();
  });

  it("shows the filter count badge and Clear filters when filters are active", () => {
    expect(element().querySelector(".sc-button__badge")).toBeNull();
    expect(button("listing filters clear")).toBeNull();

    host.filterCount.set(3);
    fixture.detectChanges();

    expect(element().querySelector(".sc-button__badge")?.textContent).toBe("3");
    expect(button("listing filters clear")).not.toBeNull();
  });

  it("emits openFilters and clearFilters", () => {
    host.filterCount.set(1);
    fixture.detectChanges();

    button("listing filters open")?.click();
    button("listing filters clear")?.click();

    expect(host.opened).toBe(1);
    expect(host.cleared).toBe(1);
  });

  it("renders the divider and projected compare buttons when compare is active", () => {
    expect(element().querySelector(".sc-floating-actions__divider")).toBeNull();

    host.compareActive.set(true);
    fixture.detectChanges();

    expect(
      element().querySelector(".sc-floating-actions__divider"),
    ).not.toBeNull();
    expect(element().querySelector("#compare")).not.toBeNull();
  });

  it("hides the bar from xl up unless compare is active", () => {
    const bar = () => element().querySelector(".sc-floating-actions");

    expect(bar()?.classList).toContain("xl:hidden");

    host.compareActive.set(true);
    fixture.detectChanges();

    expect(bar()?.classList).not.toContain("xl:hidden");
  });
});
