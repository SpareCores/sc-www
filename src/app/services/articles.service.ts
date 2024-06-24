import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ArticleMeta = {
  title: string;
  date: Date;
  teaser: string,
  image: string,
  image_alt: string,
  filename: string;
  author: string;
  tags?: string[];
}

export type SlidesMeta = {
  title: string;
  author: string;
  date: Date;
  conference: string,
  conference_url: string,
  conference_talk_url: string,
  conference_talk_video?: string,
  conference_talk_slides?: string,
  location: string;

  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  async getArticlesByType(category?: string): Promise<ArticleMeta[]> {
    let files = await firstValueFrom(this.http.get(`./assets/articles/all.json`));
    files = (files as ArticleMeta[]).filter((article: ArticleMeta) => {
      return category ? article.tags?.includes(category) : true;
    });
    return files as ArticleMeta[];
  }

  async getArticle(slug: string): Promise<string> {
    const files = await firstValueFrom(this.http.get(`./assets/articles/${slug}.md`, { responseType: 'text' } ));
    return files as string;
  }

  async getSlides(): Promise<SlidesMeta[]> {
    const slides = await firstValueFrom(this.http.get(`./assets/slides/slides.json`));
    return slides as SlidesMeta[];
  }
}
