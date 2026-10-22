import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Contact } from "./contact";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Contact", () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
