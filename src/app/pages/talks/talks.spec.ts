import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Talks } from "./talks";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Talks", () => {
  let component: Talks;
  let fixture: ComponentFixture<Talks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Talks],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Talks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
