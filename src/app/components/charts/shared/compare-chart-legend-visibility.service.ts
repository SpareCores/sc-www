import { Injectable, signal } from "@angular/core";

@Injectable()
export class CompareChartLegendVisibilityService {
  private readonly overrides = signal<ReadonlyMap<string, boolean>>(new Map());

  readonly visibilityOverrides = this.overrides.asReadonly();

  isHidden(identity: string): boolean {
    return this.overrides().get(identity) === true;
  }

  setHidden(identity: string, hidden: boolean): void {
    if (!identity) {
      return;
    }

    this.overrides.update((current) => {
      if (current.get(identity) === hidden) {
        return current;
      }
      const next = new Map(current);
      next.set(identity, hidden);
      return next;
    });
  }

  clear(): void {
    if (this.overrides().size === 0) {
      return;
    }
    this.overrides.set(new Map());
  }
}
