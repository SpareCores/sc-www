import { importProvidersFrom } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { MarkdownModule } from "ngx-markdown";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { lucideIcons } from "../app/lucide-icons";

export const sharedTestingProviders = [
  provideRouter([]),
  provideHttpClient(withFetch()),
  provideHttpClientTesting(),
  provideCharts(withDefaultRegisterables()),
  importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
  importProvidersFrom(MarkdownModule.forRoot()),
];
