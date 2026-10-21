import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Design } from "./design";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Design", () => {
  let component: Design;
  let fixture: ComponentFixture<Design>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Design],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Design);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
