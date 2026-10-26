import { Component, Input } from "@angular/core";
import { ArticleMeta } from "../../services/articles-api";
import { RouterLink } from "@angular/router";
import { TimeToShortDatePipe } from "../../pipes/time-to-short-date-pipe";

@Component({
  selector: "sc-article-card",
  imports: [RouterLink, TimeToShortDatePipe],
  templateUrl: "./article-card.html",
  styleUrl: "./article-card.scss",
})
export class ArticleCard {
  @Input() article!: ArticleMeta;
}
