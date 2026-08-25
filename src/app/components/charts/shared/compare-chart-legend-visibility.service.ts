import { Injectable, signal } from "@angular/core";

@Injectable()
export class CompareChartLegendVisibilityService {
  private readonly hidden = signal<ReadonlySet<string>>(new Set());

  readonly hiddenIdentities = this.hidden.asReadonly();

  isHidden(identity: string): boolean {
    return this.hidden().has(identity);
  }

  setHidden(identity: string, hidden: boolean): void {
    if (!identity) {
      return;
    }

    this.hidden.update((current) => {
      if (hidden === current.has(identity)) {
        return current;
      }
      const next = new Set(current);
      if (hidden) {
        next.add(identity);
      } else {
        next.delete(identity);
      }
      return next;
    });
  }

  clear(): void {
    if (this.hidden().size === 0) {
      return;
    }
    this.hidden.set(new Set());
  }
}
