import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { OverlayContainer } from "@angular/cdk/overlay";

import { Dropdown } from "../../directives/dropdown";
import { Header } from "./header";
import { CompareSelection } from "../../services/compare-selection";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Header", () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function openDropdown(triggerSelector: string): HTMLElement {
    fixture.debugElement
      .query(By.css(triggerSelector))
      .injector.get(Dropdown)
      .open();
    fixture.detectChanges();
    return TestBed.inject(OverlayContainer).getContainerElement();
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows Advisor before Resource Tracker in the mobile menu", () => {
    const menuLinks = openDropdown("#menu_button").querySelectorAll(
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
    openDropdown("#about_button");
    const hostElement = openDropdown("#menu_button");
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
      .injector.get(Dropdown);

    expect(menuDropdown.dropdownPlacement()).toBe("bottom-end");
    expect(menuDropdown.dropdownFlip()).toBeTrue();
  });

  it("configures the compare dropdown to stay within the viewport", () => {
    const serverCompare = TestBed.inject(CompareSelection);
    serverCompare.selectedForCompare = [
      {
        display_name: "a",
        vendor: "aws",
        server: "a",
        zonesRegions: [],
      },
      {
        display_name: "b",
        vendor: "aws",
        server: "b",
        zonesRegions: [],
      },
    ];
    serverCompare.selectionChanged.next(serverCompare.selectedForCompare);
    fixture.detectChanges();

    const compareDropdown = fixture.debugElement
      .query(By.css("#compare_button"))
      .injector.get(Dropdown);

    expect(compareDropdown.dropdownPlacement()).toBe("bottom-end");
    expect(compareDropdown.dropdownFlip()).toBeTrue();
  });

  it("delegates compare reordering to the compare service", () => {
    const serverCompare = TestBed.inject(CompareSelection);
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
    const serverCompare = TestBed.inject(CompareSelection);
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
    const serverCompare = TestBed.inject(CompareSelection);
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

    const rows = openDropdown("#compare_button").querySelectorAll(
      "#compare_options .compare_dropdown_row",
    );
    expect(rows.length).toBe(2);
    expect(
      rows[0].querySelector(
        '[aria-label="Toggle baseline server"][aria-pressed="true"]',
      ),
    ).not.toBeNull();
    expect(
      rows[1].querySelector(
        '[aria-label="Toggle baseline server"][aria-pressed="false"]',
      ),
    ).not.toBeNull();
  });

  it("toggles baseline selection from the compare menu", () => {
    const serverCompare = TestBed.inject(CompareSelection);
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
      {
        display_name: "t2d-standard-16",
        vendor: "gcp",
        server: "t2d-standard-16",
        zonesRegions: [],
      },
    ];
    fixture.detectChanges();

    const baselineButton = openDropdown("#compare_button").querySelector(
      '#compare_options [aria-label="Toggle baseline server"][aria-pressed="false"]',
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

  it("shows the Compare button off the compare page", () => {
    const serverCompare = TestBed.inject(CompareSelection);
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
    spyOn(component, "isOnComparePage").and.returnValue(false);
    fixture.detectChanges();

    const compareButton = openDropdown("#compare_button").querySelector(
      "#compare_options sc-button[label='Compare servers'] button",
    );

    expect(compareButton?.textContent?.trim()).toBe("Compare servers");
  });

  it("hides the Compare button on the compare page", () => {
    const serverCompare = TestBed.inject(CompareSelection);
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
    spyOn(component, "isOnComparePage").and.returnValue(true);
    fixture.detectChanges();

    const compareButton = openDropdown("#compare_button").querySelector(
      "#compare_options sc-button[label='Compare servers'] button",
    );

    expect(compareButton).toBeNull();
  });

  it("shows Servers and Databases section titles with Compare databases", () => {
    const serverCompare = TestBed.inject(CompareSelection);
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
    serverCompare.selectedDatabases = [
      { display_name: "db-a", vendor: "aws", database: "db-a" },
      { display_name: "db-b", vendor: "gcp", database: "db-b" },
    ];
    spyOn(component, "isOnComparePage").and.returnValue(false);
    spyOn(component, "isOnDatabaseComparePage").and.returnValue(false);
    fixture.detectChanges();

    const panel = openDropdown("#compare_button").querySelector(
      "#compare_options",
    ) as HTMLElement;
    const titles = Array.from(
      panel.querySelectorAll(".compare_dropdown_section_title"),
    ).map((el) => el.textContent?.trim());

    expect(titles).toEqual(["Servers", "Databases"]);
    expect(
      panel
        .querySelector("sc-button[label='Compare databases'] button")
        ?.textContent?.trim(),
    ).toBe("Compare databases");
  });

  it("opens header dropdowns in the top overlay layer", () => {
    const container = openDropdown("#about_button");

    expect(container.querySelector("#about_options")).not.toBeNull();
    expect(container.classList).not.toContain("sc-page-overlay-container");
  });

  it("exposes the mobile menu trigger as an expandable button", () => {
    const trigger = fixture.debugElement.query(By.css("#menu_button"))
      .nativeElement as HTMLButtonElement;

    openDropdown("#menu_button");

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("true");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
