import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsSidebarComponent } from "./benchmark-workloads-sidebar.component";

describe("BenchmarkWorkloadsSidebarComponent", () => {
  let component: BenchmarkWorkloadsSidebarComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadsSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
