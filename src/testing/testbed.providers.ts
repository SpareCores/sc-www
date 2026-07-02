import { importProvidersFrom } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideLucideIcons } from "@lucide/angular";
import { MarkdownModule } from "ngx-markdown";
import annotationPlugin from "chartjs-plugin-annotation";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { lucideIcons } from "../app/lucide-icons";

export const sharedTestingProviders = [
  provideRouter([]),
  provideHttpClient(withFetch()),
  provideHttpClientTesting(),
  provideCharts(withDefaultRegisterables(annotationPlugin)),
  provideLucideIcons(...lucideIcons),
  importProvidersFrom(MarkdownModule.forRoot()),
];
