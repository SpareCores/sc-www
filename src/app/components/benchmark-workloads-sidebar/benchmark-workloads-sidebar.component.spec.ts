import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsSidebarComponent } from "./benchmark-workloads-sidebar.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkWorkloadsSidebarComponent", () => {
  let component: BenchmarkWorkloadsSidebarComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadsSidebarComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
