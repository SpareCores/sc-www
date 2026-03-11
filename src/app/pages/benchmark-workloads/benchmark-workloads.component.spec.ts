import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsComponent } from "./benchmark-workloads.component";

describe("BenchmarkWorkloadsComponent", () => {
  let component: BenchmarkWorkloadsComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
