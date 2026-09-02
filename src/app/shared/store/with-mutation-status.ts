import { computed } from "@angular/core";
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";

export type MutationStatusState = {
  pendingKeys: string[];
};

export function mutationKey(scope: string, id?: string): string {
  return id ? `${scope}:${id}` : scope;
}

export function withMutationStatus() {
  return signalStoreFeature(
    withState<MutationStatusState>({ pendingKeys: [] }),
    withComputed(({ pendingKeys }) => ({
      pendingMutationKeys: computed(() => pendingKeys()),
    })),
    withMethods((store) => ({
      isMutating(key: string): boolean {
        return store.pendingKeys().includes(key);
      },
      startMutation(key: string): void {
        if (store.pendingKeys().includes(key)) {
          return;
        }
        patchState(store, { pendingKeys: [...store.pendingKeys(), key] });
      },
      finishMutation(key: string): void {
        patchState(store, {
          pendingKeys: store.pendingKeys().filter((pending) => pending !== key),
        });
      },
    })),
  );
}
