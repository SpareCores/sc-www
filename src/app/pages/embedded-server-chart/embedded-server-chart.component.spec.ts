import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbeddedServerChartComponent } from "./embedded-server-chart.component";

describe("EmbeddedServerChartComponent", () => {
  let component: EmbeddedServerChartComponent;
  let fixture: ComponentFixture<EmbeddedServerChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbeddedServerChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedServerChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
