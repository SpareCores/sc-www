import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthorBioCard } from "./author-bio-card";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AuthorBioCard", () => {
  let component: AuthorBioCard;
  let fixture: ComponentFixture<AuthorBioCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorBioCard],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorBioCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("member", {
      name: "Adam Toth",
      role: "Technical Writer",
      bio: "Bio",
      bioHtml: "Bio",
      linkedin: "https://www.linkedin.com/in/adam-toth-tw/",
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should link to the author's posts by first name", () => {
    expect(component.firstName()).toBe("Adam");
    expect(fixture.nativeElement.textContent).toContain("All posts by Adam");
  });
});
