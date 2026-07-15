import { importProvidersFrom } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideLucideIcons } from "@lucide/angular";
import { MarkdownModule } from "ngx-markdown";
import { lucideIcons } from "../app/lucide-icons";
import { provideAppCharts } from "../app/components/charts/shared/chart-providers";

export const sharedTestingProviders = [
  provideRouter([]),
  provideHttpClient(withFetch()),
  provideHttpClientTesting(),
  provideAppCharts(),
  provideLucideIcons(...lucideIcons),
  importProvidersFrom(MarkdownModule.forRoot()),
];
