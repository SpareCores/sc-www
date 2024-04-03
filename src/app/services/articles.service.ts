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

  async getArticlesByType(type: string): Promise<ArticleMeta[]> {
    let files = await firstValueFrom(this.http.get(`./assets/articles/featured.json`));
    console.log(files);
    return files as ArticleMeta[];
  }
}
