import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { ArticlesApi } from "./articles-api";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("ArticlesApi", () => {
  let service: ArticlesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...sharedTestingProviders],
    });
    service = TestBed.inject(ArticlesApi);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("adds copyable header anchors to article headings", async () => {
    const article = service.getArticle("demo");
    TestBed.inject(HttpTestingController)
      .expectOne("./assets/articles/demo.md")
      .flush('## The `best` "Pick"');

    const markdown = await article;

    expect(markdown).toContain('<div id="the-best-pick"></div>');
    expect(markdown).toContain('href="/article/demo#the-best-pick"');
    expect(markdown).toContain(
      'aria-label="Copy link to The best &quot;Pick&quot;"',
    );
    expect(markdown).toContain(
      'data-ph-capture-attribute-anchor-id="the-best-pick"',
    );
  });
});
