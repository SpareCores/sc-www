import { Component } from '@angular/core';
import { SurveyModule } from 'survey-angular-ui';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Model } from "survey-core";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import "survey-core/defaultV2.css";

@Component({
  selector: 'app-survey-fill',
  standalone: true,
  imports: [SurveyModule, BreadcrumbsComponent, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './survey-fill.component.html',
  styleUrl: './survey-fill.component.scss'
})
export class SurveyFillComponent {
    breadcrumbs: BreadcrumbSegment[] = [
        { name: 'Home', url: '/' },
        { name: 'Survey', url: '/survey' },
    ];


  surveyModel!: Model;

  constructor(private http: HttpClient,
      private route: ActivatedRoute) {

  }

  ngOnInit() {

    let id = this.route.snapshot.paramMap.get('id');

    if(id) {
      this.setup(id);

    } else {
      console.log('no id');
      window.open('/', '_self');
    }
  }

  setup(id: string) {
    this.http.get('assets/surveys/' + id + '.json').subscribe((data: any) => {
      this.surveyModel = new Model(data);

      this.surveyModel.onComplete.add(this.submit.bind(this));

    });

  }

  submit (sender: any) {
    console.log('submit', sender.data);
  }

}
