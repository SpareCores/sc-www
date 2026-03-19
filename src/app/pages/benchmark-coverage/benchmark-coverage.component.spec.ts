import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkCoverageComponent } from "./benchmark-coverage.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkCoverageComponent", () => {
  let component: BenchmarkCoverageComponent;
  let fixture: ComponentFixture<BenchmarkCoverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkCoverageComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
