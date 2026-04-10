import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SimpleChange } from "@angular/core";

import { SearchBarComponent } from "./search-bar.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("SearchBarComponent", () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for parameter descriptions", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("button");

    component.showTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Tooltip content",
    );

    expect(component.tooltipContent).toBe("Tooltip content");
    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltip.nativeElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-below",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip.nativeElement);
  });

  it("renders checkbox tooltip icons and nested single-select controls", () => {
    component.filterCategories = [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: false,
      },
    ];
    component.customControls = [
      {
        name: "baseline_region_enabled",
        category_id: "advisor",
        type: "checkbox",
        title: "Region",
        checked: true,
        description: "Tooltip only",
        descriptionDisplay: "tooltip",
      },
      {
        name: "baseline_region",
        category_id: "advisor",
        type: "singleSelect",
        title: "Available region",
        nested: true,
        hideTitle: true,
        selectedValue: "aws~us-east-1",
        selectOptions: [{ value: "aws~us-east-1", label: "US East 1" }],
      },
    ];

    fixture.detectChanges();

    const checkboxInput = fixture.nativeElement.querySelector(
      "#custom_control_checkbox_baseline_region_enabled",
    ) as HTMLInputElement;
    const checkboxContainer = checkboxInput.parentElement
      ?.parentElement as HTMLElement;
    const nestedControl = fixture.nativeElement.querySelector(
      ".custom-control--nested",
    ) as HTMLElement;

    expect(checkboxContainer.querySelector(".tooltip-trigger")).not.toBeNull();
    expect(checkboxContainer.textContent).not.toContain("Tooltip only");
    expect(nestedControl.textContent).not.toContain("Available region");
    expect(nestedControl.textContent).toContain("US East 1");
  });

  it("does not open disabled single-select controls", () => {
    const control = {
      name: "baseline_region",
      category_id: "advisor",
      type: "singleSelect",
      title: "Available region",
      disabled: true,
    } as const;

    component.toggleSingleSelectDropdown(control);

    expect(component.isSingleSelectDropdownOpen(control)).toBeFalse();
  });

  it("does not show the workload empty hint for a selected benchmark config", () => {
    component.filterCategories = [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: false,
      },
    ];
    component.customControls = [
      {
        name: "benchmark_config",
        category_id: "advisor",
        type: "benchmarkConfigSelect",
        title: "Workload",
        inputValue: "Geekbench 6 / default",
        selectedBenchmarkConfig: {
          benchmark_id: "geekbench_6",
          config: "default",
          displayName: "Geekbench 6 / default",
          configTitle: "Default",
          framework: "Geekbench",
        },
        benchmarkGroups: [],
      },
    ];

    fixture.detectChanges();

    const hintElements = fixture.nativeElement.querySelectorAll(
      ".custom-autocomplete__hint",
    ) as NodeListOf<HTMLElement>;
    const hints = Array.from(hintElements, (hint) => hint.textContent?.trim());

    expect(hints).not.toContain("No matching workloads found.");
  });

  it("shows extra-parameter vendor regions as checked while disabled", () => {
    component.filterCategories = [
      {
        category_id: "region",
        name: "Region",
        icon: "hotel",
        collapsed: true,
      },
    ];
    component.searchParameters = [
      {
        name: "vendor_regions",
        modelValue: [],
        schema: {
          category_id: "region",
          title: "Vendor and region id",
          type: "array",
          enum: ["aws~us-east-1", "aws~eu-west-1"],
        },
      },
    ];
    component.extraParameters = {
      vendor_regions: ["aws~us-east-1"],
    };
    component.vendorMetadata = [{ vendor_id: "aws", name: "AWS" }];
    component.regionMetadata.set([
      {
        vendor_id: "aws",
        region_id: "us-east-1",
        name: "US East 1",
        api_reference: "use1",
        green_energy: false,
      },
      {
        vendor_id: "aws",
        region_id: "eu-west-1",
        name: "EU West 1",
        api_reference: "euw1",
        green_energy: false,
      },
    ]);

    component.ngOnChanges({
      extraParameters: new SimpleChange({}, component.extraParameters, false),
      searchParameters: new SimpleChange([], component.searchParameters, false),
      filterCategories: new SimpleChange([], component.filterCategories, false),
    });
    fixture.detectChanges();

    const vendorRegionParameter = component.searchParameters[0];

    expect(component.filterCategories[0].collapsed).toBeFalse();
    expect(component.isVendorRegionCollapsed("aws")).toBeFalse();
    expect(vendorRegionParameter.modelValue).toEqual(["aws~us-east-1"]);
    expect(
      component.isVendorRegionSelected(vendorRegionParameter, "aws~us-east-1"),
    ).toBeTrue();
    expect(
      component.isVendorRegionCheckboxDisabled(
        vendorRegionParameter,
        "aws~us-east-1",
      ),
    ).toBeTrue();
  });
});
