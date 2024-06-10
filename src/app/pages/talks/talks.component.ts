import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ArticlesService, SlidesMeta } from '../../services/articles.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { CommonModule } from '@angular/common';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-talks',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, RouterModule, TimeToShortDatePipe, LucideAngularModule],
  templateUrl: './talks.component.html',
  styleUrl: './talks.component.scss'
})
export class TalksComponent implements OnInit {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Talks', url: '/talks' }
  ];

  talks: SlidesMeta[] = [];

  constructor(
    private SEOHandler: SeoHandlerService,
    private route: ActivatedRoute,
    private articles: ArticlesService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const category = params['tag'];
      this.articles.getSlides().then(articles => {
        this.talks = articles;
      });

      if(category) {
        this.breadcrumbs.push(
          { name: `#${category}`, url: `/articles${category ? '?tag=' + category : '' }` }
        );
      }

      this.SEOHandler.updateTitleAndMetaTags(`Conference Talks - Spare Cores`, `View all conference talks by the Spare Cores Team.`, `Cloud computing talks, finops talks, tutorials.`);

    });

  }
}
