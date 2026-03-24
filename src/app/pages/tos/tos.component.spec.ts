import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TOSComponent } from "./tos.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TOSComponent", () => {
  let component: TOSComponent;
  let fixture: ComponentFixture<TOSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TOSComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TOSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
