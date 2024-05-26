import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ArticleMeta = {
  title: string;
  date: Date;
  teaser: string,
  image: string,
  filename: string;
  author: string;
  tags?: string[];
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

  async getArticle(category: string, slug: string): Promise<string> {
    const files = await firstValueFrom(this.http.get(`./assets/articles/${category}/${slug}.md`, { responseType: 'text' } ));
    return files as string;
  }
}
