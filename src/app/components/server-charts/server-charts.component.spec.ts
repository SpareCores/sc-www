import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerChartsComponent } from "./server-charts.component";

describe("ServerChartsComponent", () => {
  let component: ServerChartsComponent;
  let fixture: ComponentFixture<ServerChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerChartsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
