import { ComponentFixture, TestBed } from "@angular/core/testing";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { SearchBarCustomControlsComponent } from "./search-bar-custom-controls.component";
import type {
  SearchBarCustomControl,
  SearchBarParameterTemplateContext,
} from "./search-bar.types";
import type { TemplateRef } from "@angular/core";

describe("SearchBarCustomControlsComponent", () => {
  let component: SearchBarCustomControlsComponent;
  let fixture: ComponentFixture<SearchBarCustomControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarCustomControlsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarCustomControlsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("filterCategoryId", "advisor");
    fixture.componentRef.setInput(
      "parameterTemplate",
      {} as TemplateRef<SearchBarParameterTemplateContext>,
    );
    fixture.detectChanges();
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

  it("drops only the framework from advisor workload option descriptions", () => {
    expect(
      component.formatBenchmarkConfigDescription({
        benchmark_id: "passmark:cpu_integer_maths",
        config: "{}",
        displayName: "PassMark: CPU Integer Maths Test",
        configTitle: "Single thread",
        framework: "passmark",
        groupLabel: "Passmark",
        benchmarkTemplate: {
          benchmark_id: "passmark:cpu_integer_maths",
          name: "PassMark: CPU Integer Maths Test",
          unit: "Millions of operations per second (Mops/s)",
          framework: "passmark",
          description: null,
          category: null,
        },
      }),
    ).toBe("Single thread | Millions of operations per second (Mops/s)");
  });

  it("does not open disabled single-select controls", () => {
    const control: SearchBarCustomControl = {
      name: "baseline_region",
      category_id: "advisor",
      type: "singleSelect",
      title: "Available region",
      disabled: true,
      selectedValue: null,
      selectOptions: [],
    };

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
    const emitSpy = spyOn(component.customControlChanged, "emit");
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

  it("does not show the workload empty hint for a selected config", () => {
    fixture.componentRef.setInput("controls", [
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
    ]);
    fixture.detectChanges();

    const hintElements = fixture.nativeElement.querySelectorAll(
      ".custom-autocomplete__hint",
    ) as NodeListOf<HTMLElement>;
    const hints = Array.from(hintElements, (hint) => hint.textContent?.trim());

    expect(hints).not.toContain("No matching workloads found.");
  });

  it("disables benchmark config inputs", () => {
    fixture.componentRef.setInput("controls", [
      {
        name: "benchmark_config",
        category_id: "advisor",
        type: "benchmarkConfigSelect",
        title: "Workload",
        placeholder: "Search workload",
        disabled: true,
        loading: true,
        benchmarkGroups: [],
      },
    ]);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input[placeholder="Search workload"]',
    ) as HTMLInputElement;

    expect(input.disabled).toBeTrue();
    expect(input.classList).toContain("custom-autocomplete__input--loading");
    expect(input.getAttribute("aria-busy")).toBe("true");
  });

  it("renders checkbox tooltips and nested single-select controls", () => {
    fixture.componentRef.setInput("controls", [
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
    ]);
    fixture.detectChanges();

    const checkboxInput = fixture.nativeElement.querySelector(
      "#custom_control_checkbox_baseline_region_enabled",
    ) as HTMLInputElement;
    const titleGroup = checkboxInput
      .closest("label, div")
      ?.querySelector(".inline-flex.w-fit") as HTMLElement;
    const nestedControl = fixture.nativeElement.querySelector(
      ".custom-control--nested",
    ) as HTMLElement;

    expect(titleGroup).not.toBeNull();
    expect(titleGroup.querySelector(".tooltip-trigger")).not.toBeNull();
    expect(titleGroup.textContent).not.toContain("Tooltip only");
    expect(nestedControl.textContent).not.toContain("Available region");
    expect(nestedControl.textContent).toContain("US East 1");
  });

  it("renders range slider summary text inline with its value", () => {
    fixture.componentRef.setInput("controls", [
      {
        name: "average_cpu_utilization",
        category_id: "advisor",
        type: "rangeSlider",
        title: "Average utilization",
        numericValue: 30,
        min: 0,
        max: 100,
        step: 10,
        unit: "%",
        valueSummary: "of 100; target score: 30",
      },
    ]);
    fixture.detectChanges();

    const sliderValue = fixture.nativeElement.querySelector(
      ".custom-slider__value",
    ) as HTMLElement;

    expect(sliderValue.textContent?.trim()).toBe(
      "30% of 100; target score: 30",
    );
  });

  it("hides the range slider thumb while its value is unset", () => {
    const control: SearchBarCustomControl = {
      name: "average_cpu_utilization",
      category_id: "advisor",
      type: "rangeSlider",
      title: "Average utilization",
      numericValue: null,
      min: 0,
      max: 100,
      step: 10,
      unit: "%",
    };
    fixture.componentRef.setInput("controls", [control]);
    fixture.detectChanges();

    const unsetSlider = fixture.nativeElement.querySelector(
      ".custom-slider__input",
    ) as HTMLInputElement;

    expect(unsetSlider.classList).toContain("custom-slider__input--unset");

    fixture.componentRef.setInput("controls", [
      { ...control, numericValue: 40 },
    ]);
    fixture.detectChanges();

    const setSlider = fixture.nativeElement.querySelector(
      ".custom-slider__input",
    ) as HTMLInputElement;

    expect(setSlider.classList).not.toContain("custom-slider__input--unset");
  });
});
