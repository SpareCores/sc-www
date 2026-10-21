import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TOS } from "./tos";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TOS", () => {
  let component: TOS;
  let fixture: ComponentFixture<TOS>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TOS],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TOS);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
