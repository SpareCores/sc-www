import { Component, Input } from '@angular/core';
import { ArticleMeta } from '../../services/articles.service';
import { RouterLink } from '@angular/router';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink, TimeToShortDatePipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss'
})
export class ArticleCardComponent {
  @Input() article!: ArticleMeta;
}
