import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from "@angular/core";
import { CollectionsStore } from "./collections.store";

export function provideCollectionsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(CollectionsStore);
    }),
  ]);
}
