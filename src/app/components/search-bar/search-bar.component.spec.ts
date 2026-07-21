import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { SearchBarComponent } from "./search-bar.component";
import { SearchBarParameterFieldComponent } from "./search-bar-parameter-field.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import type { SearchBarParameter } from "./search-bar.types";

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
    fixture.componentRef.setInput("searchParameters", []);
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
      component.tooltip().nativeElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-below",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip().nativeElement);
  });

  it("renders placed parameters after the targeted custom control", () => {
    fixture.componentRef.setInput("filterCategories", [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: false,
      },
    ]);
    fixture.componentRef.setInput("customControls", [
      {
        name: "peak_gpu_memory",
        category_id: "advisor",
        type: "powerOfTwoStepper",
        title: "Peak GPU memory usage",
        numericValue: 0,
        unit: "GiB",
        defaultNumericValue: 0.5,
        min: 0.5,
      },
    ]);
    fixture.componentRef.setInput("searchParameters", [
      {
        name: "gpus_min",
        modelValue: null,
        schema: {
          category_id: "gpu",
          title: "Min GPUs",
          type: "integer",
          range_min: 0,
          range_max: 8,
        },
      },
    ] as SearchBarParameter[]);
    fixture.componentRef.setInput("parameterPlacements", [
      {
        parameterName: "gpus_min",
        categoryId: "advisor",
        afterControlName: "peak_gpu_memory",
      },
    ]);
    fixture.detectChanges();

    const advisorCategory = fixture.nativeElement.querySelector(
      '[data-category-id="advisor"]',
    ) as HTMLElement;
    const html = advisorCategory.innerHTML;
    const controlIndex = html.indexOf("custom_control_numeric_peak_gpu_memory");
    const paramIndex = html.indexOf("filter_range_gpus_min");

    expect(controlIndex).toBeGreaterThan(-1);
    expect(paramIndex).toBeGreaterThan(controlIndex);
  });

  it("keeps parameters in their original category without placement overrides", () => {
    fixture.componentRef.setInput("filterCategories", [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: false,
      },
      {
        category_id: "storage",
        name: "Storage",
        icon: "database",
        collapsed: false,
      },
    ]);
    fixture.componentRef.setInput("customControls", [
      {
        name: "peak_gpu_memory",
        category_id: "advisor",
        type: "powerOfTwoStepper",
        title: "Peak GPU memory usage",
        numericValue: 0,
        unit: "GiB",
      },
    ]);
    fixture.componentRef.setInput("searchParameters", [
      {
        name: "storage_size",
        modelValue: null,
        schema: {
          category_id: "storage",
          title: "Storage size",
          type: "integer",
        },
      },
    ] as SearchBarParameter[]);
    fixture.detectChanges();

    const advisorCategory = fixture.nativeElement.querySelector(
      '[data-category-id="advisor"]',
    ) as HTMLElement;
    const storageCategory = fixture.nativeElement.querySelector(
      '[data-category-id="storage"]',
    ) as HTMLElement;

    expect(advisorCategory.textContent).not.toContain("Storage size");
    expect(storageCategory.textContent).toContain("Storage size");
  });

  it("expands the overridden category when a placed parameter has an active value", () => {
    const filterCategories = [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: true,
      },
      {
        category_id: "storage",
        name: "Storage",
        icon: "database",
        collapsed: true,
      },
    ];
    fixture.componentRef.setInput("filterCategories", filterCategories);
    fixture.componentRef.setInput("searchParameters", [
      {
        name: "storage_size",
        modelValue: null,
        schema: {
          category_id: "storage",
          title: "Storage size",
          type: "integer",
          default: null,
        },
      },
    ] as SearchBarParameter[]);
    fixture.componentRef.setInput("parameterPlacements", [
      {
        parameterName: "storage_size",
        categoryId: "advisor",
      },
    ]);
    fixture.componentRef.setInput("extraParameters", {
      storage_size: 100,
    });
    fixture.detectChanges();

    expect(filterCategories[0].collapsed).toBeFalse();
    expect(filterCategories[1].collapsed).toBeTrue();
  });

  it("renders a hidden-header category as expanded without its collapsible header", () => {
    const filterCategories = [
      {
        category_id: "advisor",
        name: "Advisor",
        icon: "bot",
        collapsed: true,
        hideHeader: true,
      },
    ];
    fixture.componentRef.setInput("filterCategories", filterCategories);
    fixture.componentRef.setInput("customControls", [
      {
        name: "baseline_region",
        category_id: "advisor",
        type: "singleSelect",
        title: "Available region",
        selectedValue: null,
        selectOptions: [],
      },
    ]);
    fixture.detectChanges();

    const advisorCategory = fixture.nativeElement.querySelector(
      '[data-category-id="advisor"]',
    ) as HTMLElement;

    expect(component.isCategoryExpanded(filterCategories[0])).toBeTrue();
    expect(advisorCategory.querySelector('[role="button"]')).toBeNull();
  });

  it("uses the last duplicate placement override for category resolution", () => {
    fixture.componentRef.setInput("searchParameters", [
      {
        name: "storage_size",
        modelValue: null,
        schema: {
          category_id: "storage",
          title: "Storage size",
          type: "integer",
        },
      },
    ] as SearchBarParameter[]);
    fixture.componentRef.setInput("parameterPlacements", [
      {
        parameterName: "storage_size",
        categoryId: "advisor",
      },
      {
        parameterName: "storage_size",
        categoryId: "storage",
      },
    ]);
    fixture.detectChanges();

    expect(component.getParametersByCategory("advisor")).toEqual([]);
    expect(component.getParametersByCategory("storage")).toEqual(
      component.searchParameters(),
    );
  });

  it("does not emit searchChanged while typing top search, only on blur", fakeAsync(() => {
    const parameters: SearchBarParameter[] = [
      {
        name: "search",
        modelValue: "",
        schema: { title: "Search", type: "string" },
      },
    ];
    fixture.componentRef.setInput("searchParameters", parameters);
    fixture.componentRef.setInput("useTopSearchInput", true);
    fixture.detectChanges();

    const emitSpy = spyOn(component.searchChanged, "emit");
    const parameter = parameters[0];

    component.setParameterDraftValue(parameter, "aws");
    tick(500);
    expect(emitSpy).not.toHaveBeenCalled();

    component.commitParameterInput(parameter, {
      target: { value: "aws" },
    } as unknown as Event);
    tick(500);

    expect(parameter.modelValue).toBe("aws");
    expect(emitSpy).toHaveBeenCalled();
  }));

  it("commits top search on Enter without double-emitting on following blur", fakeAsync(() => {
    const parameters: SearchBarParameter[] = [
      {
        name: "search",
        modelValue: "",
        schema: { title: "Search", type: "string" },
      },
    ];
    fixture.componentRef.setInput("searchParameters", parameters);
    fixture.componentRef.setInput("useTopSearchInput", true);
    fixture.detectChanges();

    const emitSpy = spyOn(component.searchChanged, "emit");
    const parameter = parameters[0];
    const input = document.createElement("input");
    input.value = "gcp";

    component.setParameterDraftValue(parameter, "gcp");
    component.commitParameterInput(parameter, {
      target: input,
    } as unknown as Event);
    component.commitParameterInput(parameter, {
      target: input,
    } as unknown as Event);
    tick(500);

    expect(emitSpy).toHaveBeenCalledTimes(1);
  }));

  it("clears top search immediately", fakeAsync(() => {
    const parameters: SearchBarParameter[] = [
      {
        name: "search",
        modelValue: "aws",
        schema: { title: "Search", type: "string" },
      },
    ];
    fixture.componentRef.setInput("searchParameters", parameters);
    fixture.componentRef.setInput("useTopSearchInput", true);
    fixture.detectChanges();

    const emitSpy = spyOn(component.searchChanged, "emit");
    component.clearTopSearch(parameters[0]);
    tick(0);

    expect(parameters[0].modelValue).toBe("");
    expect(emitSpy).toHaveBeenCalled();
  }));

  it("does not emit when committing an unchanged top search value", fakeAsync(() => {
    const parameters: SearchBarParameter[] = [
      {
        name: "search",
        modelValue: "aws",
        schema: { title: "Search", type: "string" },
      },
    ];
    fixture.componentRef.setInput("searchParameters", parameters);
    fixture.componentRef.setInput("query", { search: "aws" });
    fixture.detectChanges();

    const valueChangedSpy = spyOn(component, "valueChanged").and.callThrough();
    component.commitParameterInput(parameters[0], {
      target: { value: "aws" },
    } as unknown as Event);
    tick(500);

    expect(valueChangedSpy).not.toHaveBeenCalled();
    expect(parameters[0].modelValue).toBe("aws");
  }));

  it("commits number parameter fields on blur via child component", fakeAsync(() => {
    const parameters: SearchBarParameter[] = [
      {
        name: "vcpus_min",
        modelValue: null,
        schema: {
          category_id: "cpu",
          title: "Min vCPUs",
          type: "integer",
          description: "Minimum virtual CPUs",
        },
      },
    ];
    fixture.componentRef.setInput("filterCategories", [
      {
        category_id: "cpu",
        name: "CPU",
        icon: "cpu",
        collapsed: false,
      },
    ]);
    fixture.componentRef.setInput("searchParameters", parameters);
    fixture.detectChanges();

    const emitSpy = spyOn(component.searchChanged, "emit");
    const field = fixture.debugElement.query(
      By.directive(SearchBarParameterFieldComponent),
    ).componentInstance as SearchBarParameterFieldComponent;

    field.setParameterDraftValue("4");
    tick(500);
    expect(emitSpy).not.toHaveBeenCalled();

    field.commitParameterInput({
      target: { value: "4" },
    } as unknown as Event);
    tick(500);

    expect(parameters[0].modelValue).toBe(4);
    expect(emitSpy).toHaveBeenCalled();
  }));

  it("shows extra-parameter vendors as checked while disabled", () => {
    const filterCategories = [
      {
        category_id: "vendor",
        name: "Vendor",
        icon: "bot",
        collapsed: true,
      },
    ];
    const searchParameters: SearchBarParameter[] = [
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
    fixture.componentRef.setInput("filterCategories", filterCategories);
    fixture.componentRef.setInput("searchParameters", searchParameters);
    fixture.componentRef.setInput("extraParameters", {
      vendor: ["aws"],
    });
    fixture.detectChanges();

    expect(filterCategories[0].collapsed).toBeFalse();
    expect(searchParameters[0].modelValue).toEqual(["aws"]);
    expect(component.isParameterDisabled("vendor")).toBeTrue();
  });
});
