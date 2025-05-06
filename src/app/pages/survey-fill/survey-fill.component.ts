import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-survey-fill',
  standalone: true,
  imports: [SurveyModule, BreadcrumbsComponent, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './survey-fill.component.html',
  styleUrl: './survey-fill.component.scss'
})
export class SurveyFillComponent implements OnInit, OnDestroy {
    breadcrumbs: BreadcrumbSegment[] = [
        { name: 'Home', url: '/' },
        { name: 'Survey', url: '/survey' },
    ];

  surveyModel!: Model;
  visitorID: string = '';

  tracker: any;
  trackPing: number = 0;
  startedAt: number = 0;
  prevData: any;
  private subscription = new Subscription();

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

  ngOnDestroy() {
    if (this.tracker) {
      clearInterval(this.tracker);
    }
    this.subscription.unsubscribe();
  }

  private randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  setup(id: string) {
    this.visitorID = this.analytics.getId() || this.randomUUID();
    this.http.get('assets/surveys/' + id + '.json').subscribe((data: any) => {

      const title = data.title || data.metaTitle || `${id} Survey`;
      const description = data.description || data.metaDescription;
      this.SEOhandler.updateTitleAndMetaTags(title + ' - SpareCores', description, '');
      if (data.ogImage) {
        this.SEOhandler.updateThumbnail(data.ogImage);
      }

      if (isPlatformBrowser(this.platformId)) {
        this.surveyModel = new Model(data);

        this.surveyModel.applyTheme(surveyTheme);

        this.surveyModel.onComplete.add(this.submit.bind(this));
        this.surveyModel.onCurrentPageChanging.add((sender, options) => this.pageChange(sender, options));

        this.tracker = setInterval(this.trackProgress.bind(this), 10000);
        this.startedAt = Date.now();
      }
    });
  }

  submit(sender: any) {
    const payload = this.createBasePayload(sender.data);
    payload.event = 'submit';
    payload.finishedAt = Date.now();
    payload.isComplete = true;

    this.analytics.trackEvent('survey submit', payload);
    this.saveSurveyData(payload, 'submit');

    clearInterval(this.tracker);
  }

  /**
   * Save survey data on every page change.
   * @param sender The survey model that triggered the event
   * @param options Contains information about the page change, including oldCurrentPage
   */
  pageChange(sender: any, options: any) {
    const payload = this.createBasePayload(sender.data);
    payload.event = 'pageChange';
    payload.pageChangedAt = Date.now();
    payload.finishedPageIndex = options.oldCurrentPage.visibleIndex + 1;
    payload.isComplete = false;
    this.analytics.trackEvent('survey pageChange', payload);
    this.saveSurveyData(payload, 'pageChange' + payload.finishedPageIndex);
  }

  /**
   * Creates a base payload object with common properties
   * @param data The survey data to include in the payload
   * @returns A payload object with common properties
   */
  private createBasePayload(data: any): any {
    return {
      visitorID: this.visitorID,
      startedAt: this.startedAt,
      duration: Date.now() - this.startedAt,
      counter: this.trackPing,
      referrer: document.referrer,
      payload: data
    };
  }

  /**
   * Saves survey response data to S3 storage via server API
   * @param payload The survey data payload to save
   * @param event_name Optional event name to append to the filename (e.g. 'submit', 'pageChange')
   * @private
   *
   * The data is saved with a filename in the format:
   * id_{visitorID}_{event_name}_timestamp_{currentTimestamp}
   *
   * For example:
   * id_abc123_submit_timestamp_1234567890
   * id_abc123_pageChange_timestamp_1234567890
   */
  private saveSurveyData(payload: any, event_name: string = '') {
    const eventPart = event_name ? `_${event_name}` : '';
    const currentTimestamp = Date.now();
    const filename = `id_${this.visitorID}${eventPart}_timestamp_${currentTimestamp}`;
    try {
      this.http.post('/api/survey-data', {
        filename: filename,
        payload: payload
      }).subscribe({
        error: (error) => console.error('Failed to save survey data', error)
      });
    } catch (e) {
      console.error('Failed to save survey data', e);
    }
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Tracks changes in survey progress by comparing current and previous survey data
   *
   * This method:
   * 1. Stringifies current survey data to compare with previous state
   * 2. Returns early if data hasn't changed or is empty
   * 3. Updates previous data reference
   * 4. Sends analytics event with survey progress details
   */
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
