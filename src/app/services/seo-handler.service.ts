import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoHandlerService {

  constructor(
    private titleService: Title,
    private metaTagService: Meta,
  ) { }

  public updateTitleAndMetaTags(title: string, description: string, keywords: string): void {
    this.titleService.setTitle(title);

    this.metaTagService.updateTag({
      name: 'description',
      content: description,
    });
    this.metaTagService.updateTag({
      name: 'keywords',
      content: keywords,
    });

    this.metaTagService.updateTag({ name: 'twitter:title', content: title }, "name='twitter:title'");
    this.metaTagService.updateTag({ name: 'twitter:description', content: description }, "name='twitter:description'");
    this.metaTagService.updateTag({ property: 'og:title', content: title }, "property='og:title'");
    this.metaTagService.updateTag({ property: 'og:description', content: description }, "property='og:description'");
  }

  public updateThumbnail(content: string) {
    if (content) {
      this.metaTagService.updateTag({ name: 'twitter:image:src', content }, "name='twitter:image:src'");
      this.metaTagService.updateTag({ itemprop: 'image', content }, 'itemprop="image"');
      this.metaTagService.updateTag({ property: 'og:image', content }, "property='og:image'");
    }
  }
}
