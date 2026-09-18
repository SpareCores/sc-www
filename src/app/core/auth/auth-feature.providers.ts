import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from "@angular/core";
import { NewsletterService } from "../features/newsletter/newsletter.service";

export function provideAuthFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(NewsletterService);
    }),
  ]);
}
