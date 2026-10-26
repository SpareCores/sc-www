import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AboutSpareCores } from "./about-spare-cores";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AboutSpareCores", () => {
  let component: AboutSpareCores;
  let fixture: ComponentFixture<AboutSpareCores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutSpareCores],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutSpareCores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
