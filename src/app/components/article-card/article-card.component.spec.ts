import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ArticleCardComponent } from "./article-card.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ArticleCardComponent", () => {
  let component: ArticleCardComponent;
  let fixture: ComponentFixture<ArticleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCardComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCardComponent);
    component = fixture.componentInstance;
    component.article = {
      title: "Test Article",
      date: new Date("2025-01-01"),
      teaser: "Teaser",
      image: "/assets/test.png",
      image_alt: "Alt text",
      filename: "test-article",
      author: "Spare Cores",
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
