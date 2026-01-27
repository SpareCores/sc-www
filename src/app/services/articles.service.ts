import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

export type ArticleMeta = {
  title: string;
  date: Date;
  teaser: string;
  image: string;
  image_alt: string;
  filename: string;
  author: string;
  tags?: string[];
};

export type SlidesMeta = {
  title: string;
  author: string;
  date: Date;
  conference: string;
  conference_url: string;
  conference_talk_url: string;
  conference_talk_video?: string;
  conference_talk_slides?: string;
  location: string;

  filename: string;
};

export type LegalMeta = {
  title: string;
  date: Date;
  filename: string;
};

@Injectable({
  providedIn: "root",
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  async getArticlesByType(category?: string): Promise<ArticleMeta[]> {
    let files = await firstValueFrom(
      this.http.get(`./assets/articles/all.json`),
    );
    files = (files as ArticleMeta[]).filter((article: ArticleMeta) => {
      return category ? article.tags?.includes(category) : true;
    });
    return files as ArticleMeta[];
  }

  async getArticle(slug: string): Promise<string> {
    const files = await firstValueFrom(
      this.http.get(`./assets/articles/${slug}.md`, { responseType: "text" }),
    );
    return this.addHeaderAnchors(files as string, slug);
  }

  private addHeaderAnchors(markdown: string, slug: string): string {
    // replace headers with anchored versions
    return markdown.replace(
      /^(#{2,6})\s+(.+)$/gm,
      (match, hashes, headerText) => {
        const id = headerText
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        // add a hidden element before the header to offset the scroll position due to the sticky navbar
        return `<div id="${id}" style="position: relative; top: -80px; visibility: hidden"></div>\n\n${hashes} ${headerText} <a class="header-anchor" href="/article/${slug}#${id}">#</a>`;
      },
    );
  }

  async getSlides(): Promise<SlidesMeta[]> {
    const slides = await firstValueFrom(
      this.http.get(`./assets/slides/slides.json`),
    );
    return slides as SlidesMeta[];
  }

  async getLegalDocuments(): Promise<LegalMeta[]> {
    const slides = await firstValueFrom(
      this.http.get(`./assets/legal/legal-documents.json`),
    );
    return slides as LegalMeta[];
  }
}
