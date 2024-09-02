import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SurveyModule } from 'survey-angular-ui';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Model } from "survey-core";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import "survey-core/defaultV2.css";
import { surveyTheme } from './survey_theme';
import { AnalyticsService } from '../../services/analytics.service';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-survey-fill',
  standalone: true,
  imports: [SurveyModule, BreadcrumbsComponent, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './survey-fill.component.html',
  styleUrl: './survey-fill.component.scss'
})
export class SurveyFillComponent implements OnInit {
    breadcrumbs: BreadcrumbSegment[] = [
        { name: 'Home', url: '/' },
        { name: 'Survey', url: '/survey' },
    ];

  surveyModel!: Model;

  tracker: any;
  trackPing: number = 0;
  startedAt: number = 0;
  prevData: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
      private http: HttpClient,
      private SEOhandler: SeoHandlerService,
      private analytics: AnalyticsService,
      private route: ActivatedRoute) {

  }

  ngOnInit() {

    let id = this.route.snapshot.paramMap.get('id');

    if(id) {
        this.setup(id);
    } else {
      window.open('/', '_self');
    }
  }

  setup(id: string) {
    this.http.get('assets/surveys/' + id + '.json').subscribe((data: any) => {

      this.SEOhandler.updateTitleAndMetaTags(data.title  + ' - SpareCores', data.description, '');

      if (isPlatformBrowser(this.platformId)) {
        this.surveyModel = new Model(data);

        this.surveyModel.applyTheme(surveyTheme);

        this.surveyModel.onComplete.add(this.submit.bind(this));

        this.tracker = setInterval(this.trackProgress.bind(this), 10000);
        this.startedAt = Date.now();
      }
    });
  }

  submit (sender: any) {
    this.analytics.trackEvent('survey submit', {
      startedAt: this.startedAt,
      finishedAt: Date.now(),
      duration: Date.now() - this.startedAt,
      isComplete: true,
      counter: this.trackPing,
      payload: sender.data
    });

    const randomUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    const filename = `id_${this.analytics.getId() || randomUUID()}_timestamp_${this.startedAt}`;
    const payload = JSON.stringify({
      startedAt: this.startedAt,
      finishedAt: Date.now(),
      duration: Date.now() - this.startedAt,
      isComplete: true,
      counter: this.trackPing,
      referrer: document.referrer,
      payload: sender.data
    });

    try {
      this.http.put('https://eibaishapeexooyahs2chei9gohd4che.s3.eu-central-1.amazonaws.com/' + filename, payload).subscribe(() => {
      });
    } catch (e) {
      console.error('Failed to save survey data', e);
    }

    clearInterval(this.tracker);
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  trackProgress() {
    const actualData = JSON.stringify(this.surveyModel?.data);
    if (this.prevData === actualData || actualData === '{}') {
      return;
    }
    this.prevData = actualData;

    this.analytics.trackEvent('survey autosave', {
      startedAt: this.startedAt,
      counter: this.trackPing,
      payload: this.surveyModel.data
    });
  }

}
