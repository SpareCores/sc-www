import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AboutSpareCoresComponent } from "./spare-cores.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AboutSpareCoresComponent", () => {
  let component: AboutSpareCoresComponent;
  let fixture: ComponentFixture<AboutSpareCoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutSpareCoresComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutSpareCoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
