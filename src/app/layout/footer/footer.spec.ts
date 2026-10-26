import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Footer } from "./footer";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Footer", () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
