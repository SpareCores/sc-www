import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrafficPricesComponent } from "./traffic-prices.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TrafficPricesComponent", () => {
  let component: TrafficPricesComponent;
  let fixture: ComponentFixture<TrafficPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficPricesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TrafficPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
