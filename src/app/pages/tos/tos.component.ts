import { DestroyRef, OnInit, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MarkdownModule, MarkdownService } from "ngx-markdown";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import * as yaml from "js-yaml";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date.pipe";
import {
  catchError,
  filter,
  from,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from "rxjs";
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

type LegalArticleLoadResult =
  | { type: "success"; article: LegalArticleViewModel }
  | { type: "not-found" }
  | { type: "error"; error: unknown };

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
  articleNotFound = false;
  articleError: unknown | null = null;
  isLoading = false;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => params.get("id")),
        filter((id): id is string => !!id),
        tap(() => {
          this.resetViewState();
          this.isLoading = true;
        }),
        switchMap((id) => {
          if (!this.legalArticleIdPattern.test(id)) {
            console.warn(`Ignoring invalid legal article id: ${id}`);

            return of<LegalArticleLoadResult>({ type: "not-found" });
          }

          return this.http
            .get(`./assets/legal/${id}.md`, { responseType: "text" })
            .pipe(
              catchError((error: HttpErrorResponse) => {
                if (error.status === 404) {
                  console.warn(`Legal article not found: ${id}`);

                  return of<LegalArticleLoadResult>({ type: "not-found" });
                }

                console.error(`Failed to load legal article: ${id}`, error);

                return of<LegalArticleLoadResult>({ type: "error", error });
              }),
              switchMap((fileOrResult) => {
                if (typeof fileOrResult !== "string") {
                  return of(fileOrResult);
                }

                return this.parseArticle(fileOrResult, id).pipe(
                  map(
                    (article): LegalArticleLoadResult => ({
                      type: "success",
                      article,
                    }),
                  ),
                  catchError((error) => {
                    console.error(
                      `Failed to parse legal article: ${id}`,
                      error,
                    );

                    return of<LegalArticleLoadResult>({ type: "error", error });
                  }),
                );
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.isLoading = false;

        if (result.type === "success") {
          this.article = result.article;
          return;
        }

        if (result.type === "not-found") {
          this.articleNotFound = true;
          return;
        }

        this.articleError = result.error;
      });
  }

  private resetViewState() {
    this.article = null;
    this.articleNotFound = false;
    this.articleError = null;
  }

  private parseArticle(file: string, id: string) {
    const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(file);
    if (match === null) {
      return throwError(
        () => new Error("Legal article front matter is missing."),
      );
    }

    const meta = this.parseMeta(match[1]);
    if (meta === null) {
      return throwError(
        () => new Error("Legal article front matter is invalid."),
      );
    }

    const content = file.replace(/---\r?\n[\s\S]+?\r?\n---/, "");
    return from(Promise.resolve(this.markdownService.parse(content))).pipe(
      map(
        (body): LegalArticleViewModel => ({
          body,
          meta,
          breadcrumbs: [
            ...this.defaultBreadcrumbs,
            { name: meta.title, url: `/legal/${id}` },
          ],
        }),
      ),
    );
  }

  private parseMeta(frontmatter: string): LegalArticleMeta | null {
    let value: unknown;
    try {
      value = yaml.load(frontmatter);
    } catch (error) {
      console.warn("Failed to parse legal article front matter.", error);
      return null;
    }

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
