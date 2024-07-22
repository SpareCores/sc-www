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

      this.surveyModel.applyTheme({
        "themeName": "default",
        "colorPalette": "light",
        "isPanelless": false,
        "backgroundImage": "",
        "backgroundOpacity": 1,
        "backgroundImageAttachment": "scroll",
        "backgroundImageFit": "cover",
        "cssVariables": {
            "--sjs-corner-radius": "4px",
            "--sjs-base-unit": "8px",
            "--sjs-shadow-small": "0px 1px 2px 0px #34D399",
            "--sjs-shadow-inner": "inset 0px 1px 2px 0px #34D399",
            "--sjs-border-default": "#34D399",
            "--sjs-border-light": "#34D399",
            "--sjs-general-backcolor": "#06263a",
            "--sjs-general-backcolor-dark": "#06263a",
            "--sjs-general-backcolor-dim-light": "#082F49",
            "--sjs-general-backcolor-dim-dark": "#082F49",
            "--sjs-general-forecolor": "#fff",
            "--sjs-general-forecolor-light": "#E5E7EB",
            "--sjs-general-dim-forecolor": "#fff",
            "--sjs-general-dim-forecolor-light": "#E5E7EB",
            "--sjs-secondary-backcolor": "rgba(255, 152, 20, 1)",
            "--sjs-secondary-backcolor-light": "rgba(255, 152, 20, 0.1)",
            "--sjs-secondary-backcolor-semi-light": "rgba(255, 152, 20, 0.25)",
            "--sjs-secondary-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-secondary-forecolor-light": "rgba(255, 255, 255, 0.25)",
            "--sjs-shadow-small-reset": "0px 0px 0px 0px #34D399",
            "--sjs-shadow-medium": "0px 2px 6px 0px #34D399",
            "--sjs-shadow-large": "0px 8px 16px 0px #34D399",
            "--sjs-shadow-inner-reset": "inset 0px 0px 0px 0px #34D399",
            "--sjs-border-inside": "rgba(0, 0, 0, 0.16)",
            "--sjs-special-red-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-special-green": "rgba(25, 179, 148, 1)",
            "--sjs-special-green-light": "rgba(25, 179, 148, 0.1)",
            "--sjs-special-green-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-special-blue": "rgba(67, 127, 217, 1)",
            "--sjs-special-blue-light": "rgba(67, 127, 217, 0.1)",
            "--sjs-special-blue-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-special-yellow": "rgba(255, 152, 20, 1)",
            "--sjs-special-yellow-light": "rgba(255, 152, 20, 0.1)",
            "--sjs-special-yellow-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-article-font-xx-large-textDecoration": "none",
            "--sjs-article-font-xx-large-fontWeight": "700",
            "--sjs-article-font-xx-large-fontStyle": "normal",
            "--sjs-article-font-xx-large-fontStretch": "normal",
            "--sjs-article-font-xx-large-letterSpacing": "0",
            "--sjs-article-font-xx-large-lineHeight": "64px",
            "--sjs-article-font-xx-large-paragraphIndent": "0px",
            "--sjs-article-font-xx-large-textCase": "none",
            "--sjs-article-font-x-large-textDecoration": "none",
            "--sjs-article-font-x-large-fontWeight": "700",
            "--sjs-article-font-x-large-fontStyle": "normal",
            "--sjs-article-font-x-large-fontStretch": "normal",
            "--sjs-article-font-x-large-letterSpacing": "0",
            "--sjs-article-font-x-large-lineHeight": "56px",
            "--sjs-article-font-x-large-paragraphIndent": "0px",
            "--sjs-article-font-x-large-textCase": "none",
            "--sjs-article-font-large-textDecoration": "none",
            "--sjs-article-font-large-fontWeight": "700",
            "--sjs-article-font-large-fontStyle": "normal",
            "--sjs-article-font-large-fontStretch": "normal",
            "--sjs-article-font-large-letterSpacing": "0",
            "--sjs-article-font-large-lineHeight": "40px",
            "--sjs-article-font-large-paragraphIndent": "0px",
            "--sjs-article-font-large-textCase": "none",
            "--sjs-article-font-medium-textDecoration": "none",
            "--sjs-article-font-medium-fontWeight": "700",
            "--sjs-article-font-medium-fontStyle": "normal",
            "--sjs-article-font-medium-fontStretch": "normal",
            "--sjs-article-font-medium-letterSpacing": "0",
            "--sjs-article-font-medium-lineHeight": "32px",
            "--sjs-article-font-medium-paragraphIndent": "0px",
            "--sjs-article-font-medium-textCase": "none",
            "--sjs-article-font-default-textDecoration": "none",
            "--sjs-article-font-default-fontWeight": "400",
            "--sjs-article-font-default-fontStyle": "normal",
            "--sjs-article-font-default-fontStretch": "normal",
            "--sjs-article-font-default-letterSpacing": "0",
            "--sjs-article-font-default-lineHeight": "28px",
            "--sjs-article-font-default-paragraphIndent": "0px",
            "--sjs-article-font-default-textCase": "none",
            "--sjs-general-backcolor-dim": "#082F49",
            "--sjs-primary-backcolor": "#34D399",
            "--sjs-primary-backcolor-dark": "rgba(48, 196, 142, 1)",
            "--sjs-primary-backcolor-light": "rgba(52, 211, 153, 0.1)",
            "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
            "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
            "--sjs-special-red": "rgba(229, 10, 62, 1)",
            "--sjs-special-red-light": "rgba(229, 10, 62, 0.1)"
        },
        "headerView": "basic"
    });

      this.surveyModel.onComplete.add(this.submit.bind(this));

    });

  }

  submit (sender: any) {
    console.log('submit', sender.data);
  }

}
