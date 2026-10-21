import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Articles } from "./articles";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Articles", () => {
  let component: Articles;
  let fixture: ComponentFixture<Articles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Articles],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Articles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
