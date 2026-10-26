import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ArticleCard } from "./article-card";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ArticleCard", () => {
  let component: ArticleCard;
  let fixture: ComponentFixture<ArticleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCard],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCard);
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
