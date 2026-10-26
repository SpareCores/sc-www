import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from "@angular/core";
import { Newsletter } from "../features/newsletter/newsletter";

export function provideAuthFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(Newsletter);
    }),
  ]);
}
