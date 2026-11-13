import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompareToolbar } from "./compare-toolbar";
import { CompareToolbarItem } from "./compare-toolbar.types";
import { availableCurrencies } from "../../tools/shared_data";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("CompareToolbar", () => {
  const item: CompareToolbarItem = {
    vendor_id: "aws",
    api_reference: "m5.large",
    display_name: "m5.large",
  };
  let component: CompareToolbar<CompareToolbarItem>;
  let fixture: ComponentFixture<CompareToolbar<CompareToolbarItem>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareToolbar],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareToolbar<CompareToolbarItem>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("resource", "server");
    fixture.componentRef.setInput("items", [item]);
    fixture.componentRef.setInput("currency", availableCurrencies[0]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.baselineLabel()).toBe("Baseline server");
  });

  it("labels the selected baseline with its vendor", () => {
    fixture.componentRef.setInput("baseline", item);

    expect(component.baselineLabel()).toBe("m5.large (aws)");
  });

  it("emits baseline and currency selections", () => {
    const baselineSpy = jasmine.createSpy("baseline");
    const currencySpy = jasmine.createSpy("currency");
    component.baselineSelected.subscribe(baselineSpy);
    component.currencySelected.subscribe(currencySpy);

    component.selectBaseline(item);
    component.selectCurrency(availableCurrencies[1]);

    expect(baselineSpy).toHaveBeenCalledWith(item);
    expect(currencySpy).toHaveBeenCalledWith(availableCurrencies[1]);
  });
});
