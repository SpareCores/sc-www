import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Location, isPlatformServer } from '@angular/common';
import { REQUEST } from '../../express.tokens';
import { Request } from 'express';

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

  constructor(private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional()@Inject(REQUEST) private request: Request,
    private location: Location) { }

  async getArticlesByType(category?: string): Promise<ArticleMeta[]> {
    let files = await firstValueFrom(this.http.get(`/assets/articles/all.json`));
    files = (files as ArticleMeta[]).filter((article: ArticleMeta) => {
      return category ? article.tags?.includes(category) : true;
    });
    return files as ArticleMeta[];
  }

  async getArticle(slug: string): Promise<string> {
    let baseUrl: string = '.';
    if (isPlatformServer(this.platformId)) {
      if(this.request) {
        baseUrl = `${this.request?.protocol}://${this.request?.get('host')}`;
      }
    } else {
      baseUrl = `${window.location.protocol}//${window.location.host}`;
    }
    const files = await firstValueFrom(this.http.get(`${baseUrl}/assets/articles/${slug}.md`, { responseType: 'text' } ));
    return files as string;
  }

  async getSlides(): Promise<SlidesMeta[]> {
    const slides = await firstValueFrom(this.http.get(`/assets/slides/slides.json`));
    return slides as SlidesMeta[];
  }
}
