import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthorAvatars } from "./author-avatars";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AuthorAvatars", () => {
  let component: AuthorAvatars;
  let fixture: ComponentFixture<AuthorAvatars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorAvatars],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorAvatars);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("authors", ["Adam Toth", "Gergely Daroczi"]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render one avatar per author", () => {
    const images = fixture.nativeElement.querySelectorAll("img");
    expect(images.length).toBe(2);
  });
});
