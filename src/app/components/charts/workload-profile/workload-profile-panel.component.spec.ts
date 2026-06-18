import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkloadProfilePanelComponent } from "./workload-profile-panel.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import { Status } from "../../../../../sdk/data-contracts";

describe("WorkloadProfilePanelComponent", () => {
  let fixture: ComponentFixture<WorkloadProfilePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkloadProfilePanelComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkloadProfilePanelComponent);
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        description: "Web server workload profile",
        status: Status.Active,
      },
    ]);
    fixture.detectChanges();
  });

  it("renders the workload profile panel", () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Web server",
    );
  });
});
