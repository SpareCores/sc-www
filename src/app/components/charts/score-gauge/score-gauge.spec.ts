import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ScoreGauge } from "./score-gauge";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";

describe("ScoreGauge", () => {
  let fixture: ComponentFixture<ScoreGauge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreGauge],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreGauge);
    fixture.componentRef.setInput("value", 50);
    fixture.componentRef.setInput("max", 200);
    fixture.componentRef.setInput("displayValue", "50");
    fixture.componentRef.setInput("label", "Single-core");
    fixture.detectChanges();
  });

  it("should create with the value and label", () => {
    expect(fixture.nativeElement.textContent).toContain("50");
    expect(fixture.nativeElement.textContent).toContain("(Single-core)");
  });

  it("fills the gauge by the ratio to the max", () => {
    expect(fixture.componentInstance.data().datasets[0].data).toEqual([
      0.25, 0.75,
    ]);

    fixture.componentRef.setInput("max", null);
    expect(fixture.componentInstance.data().datasets[0].data).toEqual([0, 1]);
  });
});
