import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SimpleChange } from "@angular/core";

import {
  SearchBarComponent,
  SearchBarCustomControl,
} from "./search-bar.component";
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

  it("formats binary memory steppers as TiB when blurred and GiB while editing", () => {
    const control: SearchBarCustomControl = {
      name: "minimum_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Minimum memory",
      numericValue: 1536,
      numericFormat: "binaryMemory",
      unit: "GiB",
      defaultNumericValue: 0.5,
      min: 0.5,
    };

    expect(component.getPowerOfTwoStepperInputValue(control)).toBe("1.5");
    expect(component.getPowerOfTwoStepperInputUnit(control)).toBe("TiB");

    component.handlePowerOfTwoStepperFocus(control);

    expect(component.getPowerOfTwoStepperInputValue(control)).toBe("1536");
    expect(component.getPowerOfTwoStepperInputUnit(control)).toBe("GiB");
  });

  it("commits typed power-of-two stepper values as canonical GiB numbers", () => {
    const emitSpy = spyOn(component.customControlChanged, "emit");
    const control: SearchBarCustomControl = {
      name: "minimum_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Minimum memory",
      numericValue: 0.5,
      numericFormat: "binaryMemory",
      unit: "GiB",
      defaultNumericValue: 0.5,
      min: 0.5,
    };
    const input = document.createElement("input");

    component.handlePowerOfTwoStepperFocus(control);
    input.value = "1.25";

    component.onPowerOfTwoStepperInput(control, {
      target: input,
    } as unknown as Event);
    component.commitPowerOfTwoStepperAfterFocusLoss(control, {
      target: input,
    } as unknown as Event);

    expect(emitSpy).toHaveBeenCalledOnceWith({
      name: "minimum_memory",
      value: { numericValue: 1.25 },
    });
  });

  it("snaps power-of-two buttons from arbitrary typed values", () => {
    const emitSpy = spyOn(component.customControlChanged, "emit");
    const control: SearchBarCustomControl = {
      name: "minimum_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Minimum memory",
      numericValue: 2,
      numericFormat: "binaryMemory",
      unit: "GiB",
      defaultNumericValue: 0.5,
      min: 0.5,
    };
    const input = document.createElement("input");

    component.handlePowerOfTwoStepperFocus(control);
    input.value = "3";
    component.onPowerOfTwoStepperInput(control, {
      target: input,
    } as unknown as Event);

    component.incrementPowerOfTwoValue(control);

    expect(emitSpy).toHaveBeenCalledWith({
      name: "minimum_memory",
      value: { numericValue: 4 },
    });

    emitSpy.calls.reset();
    input.value = "3";
    component.onPowerOfTwoStepperInput(control, {
      target: input,
    } as unknown as Event);

    component.decrementPowerOfTwoValue(control);

    expect(emitSpy).toHaveBeenCalledWith({
      name: "minimum_memory",
      value: { numericValue: 2 },
    });
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

  it("shows extra-parameter vendors as checked while disabled", () => {
    component.filterCategories = [
      {
        category_id: "vendor",
        name: "Vendor",
        icon: "bot",
        collapsed: true,
      },
    ];
    component.searchParameters = [
      {
        name: "vendor",
        modelValue: [],
        schema: {
          category_id: "vendor",
          title: "Vendor",
          type: "array",
          enum: ["aws", "gcp"],
        },
      },
    ];
    component.extraParameters = {
      vendor: ["aws"],
    };

    component.ngOnChanges({
      extraParameters: new SimpleChange({}, component.extraParameters, false),
      searchParameters: new SimpleChange([], component.searchParameters, false),
      filterCategories: new SimpleChange([], component.filterCategories, false),
    });
    fixture.detectChanges();

    const vendorParameter = component.searchParameters[0];

    expect(component.filterCategories[0].collapsed).toBeFalse();
    expect(vendorParameter.modelValue).toEqual(["aws"]);
    expect(component.isEnumSelected(vendorParameter, "aws")).toBeTrue();
    expect(component.isParameterDisabled("vendor")).toBeTrue();
  });
});
