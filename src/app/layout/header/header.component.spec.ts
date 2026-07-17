import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import { HeaderComponent } from "./header.component";
import { ServerCompareService } from "../../services/server-compare.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows Advisor before Resource Tracker in the mobile menu", () => {
    const menuLinks = (fixture.nativeElement as HTMLElement).querySelectorAll(
      "#menu_options .navbar_link",
    );
    const menuOptions = Array.from(menuLinks).map(
      (element) => (element as HTMLElement).textContent?.trim() ?? "",
    );

    expect(menuOptions.indexOf("Advisor")).toBeGreaterThan(-1);
    expect(menuOptions.indexOf("Resource Tracker")).toBeGreaterThan(-1);
    expect(menuOptions.indexOf("Advisor")).toBeLessThan(
      menuOptions.indexOf("Resource Tracker"),
    );
  });

  it("shows Partners in the about navigation", () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const aboutPartnersLink = hostElement.querySelector(
      '#about_options a[routerLink="/about/partners"]',
    );
    const mobilePartnersLink = hostElement.querySelector(
      '#menu_options a[routerLink="/about/partners"]',
    );

    expect(aboutPartnersLink?.textContent).toContain("Partners");
    expect(mobilePartnersLink?.textContent).toContain("Partners");
  });

  it("configures the mobile menu dropdown to stay within the viewport", () => {
    const menuDropdown = fixture.debugElement
      .query(By.css("#menu_button"))
      .injector.get(FlowbiteDropdownDirective);

    expect(menuDropdown.dropdownPlacement()).toBe("bottom-end");
    expect(menuDropdown.dropdownFlip()).toBeTrue();
  });

  it("configures the compare dropdown to stay within the viewport", () => {
    const compareDropdown = fixture.debugElement
      .query(By.css("#compare_button"))
      .injector.get(FlowbiteDropdownDirective);

    expect(compareDropdown.dropdownPlacement()).toBe("bottom-end");
    expect(compareDropdown.dropdownFlip()).toBeTrue();
  });

  it("delegates compare reordering to the compare service", () => {
    const serverCompare = TestBed.inject(ServerCompareService);
    const reorderSelectedForCompare = spyOn(
      serverCompare,
      "reorderSelectedForCompare",
    );

    component.dropComparedServer({
      previousIndex: 0,
      currentIndex: 2,
    } as CdkDragDrop<unknown>);

    expect(reorderSelectedForCompare).toHaveBeenCalledWith(0, 2);
  });

  it("removes a server from the compare selection", () => {
    const serverCompare = TestBed.inject(ServerCompareService);
    const toggleCompare = spyOn(serverCompare, "toggleCompare");
    const server = {
      display_name: "m7a.4xlarge",
      vendor: "aws",
      server: "m7a.4xlarge",
      zonesRegions: [],
    };

    component.removeFromCompare(server);

    expect(toggleCompare).toHaveBeenCalledWith(false, server);
  });

  it("shows the target icon next to the baseline server", () => {
    const serverCompare = TestBed.inject(ServerCompareService);
    serverCompare.selectedForCompare = [
      {
        display_name: "m7a.4xlarge",
        vendor: "aws",
        server: "m7a.4xlarge",
        zonesRegions: [],
      },
      {
        display_name: "t2d-standard-16",
        vendor: "gcp",
        server: "t2d-standard-16",
        zonesRegions: [],
      },
    ];
    serverCompare.setBaselineServer({
      vendor: "aws",
      server: "m7a.4xlarge",
    });
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll(
      "#compare_options .compare_dropdown_row",
    );
    expect(rows.length).toBe(2);
    expect(
      rows[0].querySelector('[aria-label="Clear baseline server"]'),
    ).not.toBeNull();
    expect(
      rows[1].querySelector('[aria-label="Set baseline server"]'),
    ).not.toBeNull();
  });

  it("toggles baseline selection from the compare menu", () => {
    const serverCompare = TestBed.inject(ServerCompareService);
    const toggleBaselineServer = spyOn(
      serverCompare,
      "toggleBaselineServer",
    ).and.callThrough();
    serverCompare.selectedForCompare = [
      {
        display_name: "m7a.4xlarge",
        vendor: "aws",
        server: "m7a.4xlarge",
        zonesRegions: [],
      },
    ];
    fixture.detectChanges();

    const baselineButton = (fixture.nativeElement as HTMLElement).querySelector(
      '#compare_options [aria-label="Set baseline server"]',
    ) as HTMLButtonElement;
    baselineButton.click();

    expect(toggleBaselineServer).toHaveBeenCalledWith(
      jasmine.objectContaining({
        vendor: "aws",
        server: "m7a.4xlarge",
      }),
    );
    expect(
      serverCompare.isBaselineServer({ vendor: "aws", server: "m7a.4xlarge" }),
    ).toBeTrue();
  });
});
