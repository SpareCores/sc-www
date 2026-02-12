import { OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MarkdownModule, MarkdownService } from "ngx-markdown";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { DomSanitizer } from "@angular/platform-browser";
import * as yaml from "js-yaml";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date.pipe";

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
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private markdownService = inject(MarkdownService);
  private domSanitizer = inject(DomSanitizer);

  articleBody: any;
  articleMeta: any;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/legal" },
  ];

  ngOnInit() {
    this.route.params.subscribe(() => {
      let id = this.route.snapshot.paramMap.get("id");

      this.http
        .get(`./assets/legal/${id}.md`, { responseType: "text" })
        .subscribe((file: any) => {
          // Assuming `file` is a string containing your Markdown content...
          const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(file);
          if (match === null) {
            return;
          }
          this.articleMeta = yaml.load(match[1]);
          const content = file.replace(/---\r?\n[\s\S]+?\r?\n---/, "");

          this.articleBody = this.domSanitizer.bypassSecurityTrustHtml(
            this.markdownService.parse(content) as string,
          );

          this.breadcrumbs = [
            { name: "Home", url: "/" },
            { name: "Legal", url: "/legal" },
            { name: this.articleMeta.title, url: `/legal/${id}` },
          ];
        });
    });
  }
}
