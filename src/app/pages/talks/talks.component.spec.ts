import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TalksComponent } from "./talks.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TalksComponent", () => {
  let component: TalksComponent;
  let fixture: ComponentFixture<TalksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalksComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TalksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
