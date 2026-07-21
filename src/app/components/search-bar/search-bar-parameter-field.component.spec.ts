import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NumbersOnlyDirective } from "../../directives/numbers-only.directive";
import { SearchBarParameterFieldComponent } from "./search-bar-parameter-field.component";
import type { SearchBarParameter } from "./search-bar.types";

describe("SearchBarParameterFieldComponent", () => {
  let component: SearchBarParameterFieldComponent;
  let fixture: ComponentFixture<SearchBarParameterFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarParameterFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarParameterFieldComponent);
    component = fixture.componentInstance;
  });

  it("does not emit valueChanged while drafting a number, only on blur", () => {
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

    const emitSpy = spyOn(component.valueChanged, "emit");

    component.setParameterDraftValue("1.5");
    expect(emitSpy).not.toHaveBeenCalled();

    component.commitParameterInput({
      target: { value: "1.5" },
    } as unknown as Event);

    expect(parameter.modelValue).toBe(1.5);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it("attaches appNumbersOnly to numeric inputs", () => {
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

    const input = fixture.debugElement.query(By.directive(NumbersOnlyDirective));

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

    const group = fixture.nativeElement.querySelector(
      ".inline-flex.w-fit",
    ) as HTMLElement;

    expect(group).not.toBeNull();
    expect(group.querySelector(".tooltip-trigger")).not.toBeNull();
    expect(group.textContent).toContain("Max price");
  });
});
