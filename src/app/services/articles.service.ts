import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ArticleMeta = {
  title: string;
  date: Date;
  teaser: string,
  image: string,
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  async getArticlesByType(category?: string): Promise<ArticleMeta[]> {
    let files = await firstValueFrom(this.http.get(`./assets/articles/${category ? category : 'all'}.json`));
    return files as ArticleMeta[];
  }

  async getArticle(category: string, slug: string): Promise<string> {
    let files = await firstValueFrom(this.http.get(`./assets/articles/${category}/${slug}.md`, { responseType: 'text' } ));
    return files as string;
  }
}
