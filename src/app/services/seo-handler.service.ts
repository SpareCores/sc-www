import { Inject, Injectable, Optional, PLATFORM_ID } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { REQUEST } from "../../express.tokens";
import { isPlatformBrowser } from "@angular/common";
import { Request } from "express";

@Injectable({
  providedIn: "root",
})
export class SeoHandlerService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(REQUEST) @Optional() private request_express?: Request,
  ) {}

  public getBaseURL(): string {
    let baseUrl = "https://sparecores.com";
    if (isPlatformBrowser(this.platformId)) {
      baseUrl = window.location.origin;
    } else if (this.request_express) {
      baseUrl = `${this.request_express?.protocol}://${this.request_express?.get("host")}`;
    }
    return baseUrl;
  }

  public updateCanonical(document: Document, url: string) {
    const canonicalUrl = url;
    const head = document.getElementsByTagName("head")[0];
    let element: HTMLLinkElement | null =
      document.querySelector(`link[rel='canonical']`) || null;
    if (element == null) {
      element = document.createElement("link") as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute("rel", "canonical");
    element.setAttribute("href", canonicalUrl);

    this.metaTagService.updateTag(
      { property: "og:url", content: canonicalUrl },
      "property='og:url'",
    );
  }

  public updateTitleAndMetaTags(
    title: string,
    description: string,
    keywords: string,
  ): void {
    this.titleService.setTitle(title);

    this.metaTagService.updateTag({
      name: "description",
      content: description,
    });
    this.metaTagService.updateTag({
      name: "keywords",
      content: keywords,
    });

    this.metaTagService.updateTag(
      { name: "twitter:title", content: title },
      "name='twitter:title'",
    );
    this.metaTagService.updateTag(
      { name: "twitter:description", content: description },
      "name='twitter:description'",
    );
    this.metaTagService.updateTag(
      { property: "og:title", content: title },
      "property='og:title'",
    );
    this.metaTagService.updateTag(
      { property: "og:description", content: description },
      "property='og:description'",
    );

    this.setFollow();
  }

  public updateThumbnail(content: string) {
    if (content) {
      this.metaTagService.updateTag(
        { name: "twitter:image:src", content },
        "name='twitter:image:src'",
      );
      this.metaTagService.updateTag(
        { itemprop: "image", content },
        'itemprop="image"',
      );
      this.metaTagService.updateTag(
        { property: "og:image", content },
        "property='og:image'",
      );
    }
  }

  public restoreThumbnail() {
    const content = "https://sparecores.com/assets/images/media/landing.png";
    this.metaTagService.updateTag(
      { name: "twitter:image:src", content },
      "name='twitter:image:src'",
    );
    this.metaTagService.updateTag(
      { itemprop: "image", content },
      'itemprop="image"',
    );
    this.metaTagService.updateTag(
      { property: "og:image", content },
      "property='og:image'",
    );
  }

  public setupStructuredData(document: any, value: string[]) {
    this.cleanupStructuredData(document);
    value?.forEach((item) => {
      this.addStructuredDataToHead(document, item);
    });
  }

  public cleanupStructuredData(document: Document) {
    // Remove any existing structured data scripts
    const existingScripts = document.head.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    for (let i = 0; i < existingScripts.length; i++) {
      const script = existingScripts[i];
      script.parentNode?.removeChild(script);
    }
  }

  public addStructuredDataToHead(document: Document, scriptContent: string) {
    // Remove any existing structured data scripts
    this.cleanupStructuredData(document);

    // Create a new script element and add the structured data to it
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = scriptContent;

    document.getElementsByTagName("head")[0].appendChild(script);
  }

  public setNoFollow() {
    this.metaTagService.updateTag({
      name: "robots",
      content: "noindex, nofollow",
    });
  }

  public setFollow() {
    this.metaTagService.updateTag({
      name: "robots",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });
  }
}
