import { DestroyRef, OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MarkdownModule, MarkdownService } from "ngx-markdown";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import * as yaml from "js-yaml";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date.pipe";
import { catchError, filter, from, map, of, switchMap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface LegalArticleMeta {
  title: string;
  date: Date;
  priority?: number;
}

interface LegalArticleViewModel {
  body: string;
  meta: LegalArticleMeta;
  breadcrumbs: BreadcrumbSegment[];
}

@Component({
  selector: "app-tos",
  imports: [
    BreadcrumbsComponent,
    RouterModule,
    MarkdownModule,
    TimeToShortDatePipe,
  ],
  templateUrl: "./tos.component.html",
  styleUrl: "./tos.component.scss",
})
export class TOSComponent implements OnInit {
  private readonly legalArticleIdPattern = /^[a-z0-9_-]+$/i;
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private markdownService = inject(MarkdownService);

  readonly defaultBreadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/legal" },
  ];

  article: LegalArticleViewModel | null = null;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => params.get("id")),
        filter((id): id is string => !!id),
        switchMap((id) => {
          if (!this.legalArticleIdPattern.test(id)) {
            console.warn(`Ignoring invalid legal article id: ${id}`);
            return of(null);
          }

          return this.http
            .get(`./assets/legal/${id}.md`, { responseType: "text" })
            .pipe(
              switchMap((file) => this.parseArticle(file, id)),
              catchError((error) => {
                console.error(`Failed to load legal article: ${id}`, error);
                return of(null);
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((article) => {
        this.article = article;
      });
  }

  private parseArticle(file: string, id: string) {
    const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(file);
    if (match === null) {
      return of(null);
    }

    const meta = this.parseMeta(match[1]);
    if (meta === null) {
      return of(null);
    }

    const content = file.replace(/---\r?\n[\s\S]+?\r?\n---/, "");
    return from(Promise.resolve(this.markdownService.parse(content))).pipe(
      map(
        (body): LegalArticleViewModel => ({
          body,
          meta,
          breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Legal", url: "/legal" },
            { name: meta.title, url: `/legal/${id}` },
          ],
        }),
      ),
    );
  }

  private parseMeta(frontmatter: string): LegalArticleMeta | null {
    const value = yaml.load(frontmatter);
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate["title"] !== "string" ||
      (typeof candidate["date"] !== "string" &&
        !(candidate["date"] instanceof Date))
    ) {
      return null;
    }

    const date = new Date(candidate["date"]);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return {
      title: candidate["title"],
      date,
      priority:
        typeof candidate["priority"] === "number"
          ? candidate["priority"]
          : undefined,
    };
  }
}
