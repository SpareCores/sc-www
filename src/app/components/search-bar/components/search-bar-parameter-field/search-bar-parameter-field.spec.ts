import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NumbersOnly } from "../../../../directives/numbers-only";
import { SearchBarParameterField } from "./search-bar-parameter-field";
import type { SearchBarParameter } from "../../types/search-bar.types";
import { sharedTestingProviders } from "../../../../../testing/testbed.providers";

describe("SearchBarParameterField", () => {
  let component: SearchBarParameterField;
  let fixture: ComponentFixture<SearchBarParameterField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarParameterField],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarParameterField);
    component = fixture.componentInstance;
  });

  it("does not emit filterServers while drafting a number, only on blur", () => {
    const parameter: SearchBarParameter = {
      name: "price_max",
      modelValue: null,
      schema: {
        category_id: "price",
        title: "Max price",
        type: "number",
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("filterCategoryId", "price");
    fixture.detectChanges();

    const emitSpy = spyOn(component.filterServers, "emit");

    component.setParameterDraftValue("1.5");
    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.isParameterDraftDirty(parameter)).toBeTrue();

    component.commitParameterInput({
      target: { value: "1.5" },
    } as unknown as Event);

    expect(parameter.modelValue).toBe(1.5);
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(component.isParameterDraftDirty(parameter)).toBeFalse();
  });

  it("shows pending hint markup while number draft is dirty", () => {
    const parameter: SearchBarParameter = {
      name: "price_max",
      modelValue: null,
      schema: {
        category_id: "price",
        title: "Max price",
        type: "number",
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("filterCategoryId", "price");
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".filter-draft-pending-hint"),
    ).toBeNull();

    component.setParameterDraftValue("2");
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector(
      ".filter-draft-pending-hint",
    ) as HTMLElement;
    const input = fixture.nativeElement.querySelector(
      "#filter_price_price_max",
    ) as HTMLInputElement;

    expect(hint).not.toBeNull();
    expect(input).not.toBeNull();
    expect(hint.textContent).toContain(
      "Press Enter or click away to apply filter.",
    );
    expect(input.classList.contains("filter-draft-input--dirty")).toBeTrue();
  });

  it("attaches scNumbersOnly to numeric inputs", () => {
    const parameter: SearchBarParameter = {
      name: "price_max",
      modelValue: null,
      schema: {
        category_id: "price",
        title: "Max price",
        type: "number",
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("filterCategoryId", "price");
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.directive(NumbersOnly));

    expect(input).not.toBeNull();
    expect(input.nativeElement.id).toBe("filter_price_price_max");
  });

  it("wraps title and tooltip trigger in inline-flex w-fit", () => {
    const parameter: SearchBarParameter = {
      name: "price_max",
      modelValue: null,
      schema: {
        category_id: "price",
        title: "Max price",
        type: "number",
        description: "Help text",
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("filterCategoryId", "price");
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector(
      "#filter_title_price_max",
    ) as HTMLElement;

    expect(title).not.toBeNull();
    expect(title.querySelector(".tooltip-trigger")).not.toBeNull();
    expect(title.textContent).toContain("Max price");
  });

  it("does not re-emit valueChanged when range model was already synced", () => {
    const parameter: SearchBarParameter = {
      name: "vcpus_min",
      modelValue: 1,
      schema: {
        category_id: "processor",
        title: "Min vCPUs",
        type: "number",
        range_min: 1,
        range_max: 256,
        null_value: 1,
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("filterCategoryId", "processor");
    fixture.detectChanges();

    const emitSpy = spyOn(component.valueChanged, "emit");
    component.onRangeSliderChanged();
    expect(emitSpy).not.toHaveBeenCalled();

    parameter.modelValue = 57;
    component.onRangeSliderChanged();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  describe("long checkbox lists", () => {
    function createEnumParameter(modelValue: string[]): SearchBarParameter {
      return {
        name: "architecture",
        modelValue,
        schema: {
          category_id: "processor",
          title: "Processor architecture",
          type: "array",
          enum: ["arm64", "arm64_mac", "i386", "x86_64", "x86_64_mac"],
        },
      };
    }

    function optionIds(): string[] {
      return Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll(
          'input[type="checkbox"]',
        ),
      )
        .filter((input) => !input.parentElement?.classList.contains("hidden"))
        .map((input) => input.id);
    }

    function toggleButton(): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        'sc-button[data-ph-capture-attribute-sc-event="search bar see all options"] button',
      ) as HTMLButtonElement;
    }

    it("shows the first four options and toggles the rest with See all", () => {
      fixture.componentRef.setInput("parameter", createEnumParameter([]));
      fixture.componentRef.setInput("filterCategoryId", "processor");
      fixture.detectChanges();

      expect(optionIds().length).toBe(4);
      expect(toggleButton().textContent).toContain("See all (5)");

      toggleButton().click();
      fixture.detectChanges();

      expect(optionIds().length).toBe(5);
      expect(toggleButton().textContent).toContain("See less");
    });

    it("keeps selected options visible while collapsed", () => {
      fixture.componentRef.setInput(
        "parameter",
        createEnumParameter(["x86_64_mac"]),
      );
      fixture.componentRef.setInput("filterCategoryId", "processor");
      fixture.detectChanges();

      expect(optionIds()).toContain("filter_enum_architecture_x86_64_mac");
      expect(optionIds().length).toBe(5);
    });

    it("lays the options out in a grid from xl when compact", () => {
      fixture.componentRef.setInput("parameter", createEnumParameter([]));
      fixture.componentRef.setInput("filterCategoryId", "processor");
      fixture.componentRef.setInput("compactFromXl", true);
      fixture.detectChanges();

      const list = (fixture.nativeElement as HTMLElement).querySelector(
        "#filter_enum_architecture_arm64",
      )?.parentElement?.parentElement;

      expect(list?.classList).toContain("search_bar_options--grid");
    });

    it("shows up to 12 options from xl without See all", () => {
      fixture.componentRef.setInput("parameter", createEnumParameter([]));
      fixture.componentRef.setInput("filterCategoryId", "processor");
      fixture.componentRef.setInput("compactFromXl", true);
      fixture.detectChanges();

      const lastOption = (fixture.nativeElement as HTMLElement).querySelector(
        "#filter_enum_architecture_x86_64_mac",
      )?.parentElement;

      expect(toggleButton().closest("div")?.classList).toContain("xl:hidden");
      expect(lastOption?.classList).toContain("xl:flex");
    });

    it("shows every option and hides See all from xl when requested", () => {
      fixture.componentRef.setInput("parameter", createEnumParameter([]));
      fixture.componentRef.setInput("filterCategoryId", "processor");
      fixture.componentRef.setInput("showAllOptionsFromXl", true);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      const lastOption = host.querySelector(
        "#filter_enum_architecture_x86_64_mac",
      )?.parentElement;

      expect(lastOption?.classList).toContain("xl:flex");
      expect(toggleButton().closest("div")?.classList).toContain("xl:hidden");
    });
  });
});
