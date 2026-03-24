import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegionsComponent as RegionsComponent } from "./regions.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("RegionsComponent", () => {
  let component: RegionsComponent;
  let fixture: ComponentFixture<RegionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(RegionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
