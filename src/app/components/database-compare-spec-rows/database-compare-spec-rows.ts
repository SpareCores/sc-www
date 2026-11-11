import { Component, inject, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideCheck, LucideInfo, LucideX } from "@lucide/angular";
import { CompareDeltaView } from "../charts/shared/server-compare-table.utils";
import { DatabaseCompareSpecs } from "../../services/database-compare-specs";
import {
  ComparePropertyRow,
  ComparePropertySection,
  LoadedCompareDatabase,
} from "../../services/database-compare-specs.types";

@Component({
  selector: "sc-database-compare-spec-rows",
  imports: [LucideCheck, LucideInfo, LucideX, RouterLink],
  templateUrl: "./database-compare-spec-rows.html",
  styleUrl: "./database-compare-spec-rows.css",
})
export class DatabaseCompareSpecRows {
  private compareSpecs = inject(DatabaseCompareSpecs);

  sections = input<ComparePropertySection[]>([]);
  priceRows = input<ComparePropertyRow[]>([]);
  databases = input<LoadedCompareDatabase[]>([]);
  baselineIndex = input(-1);
  linkTarget = input<string | null>(null);

  descriptionEnter = output<{ event: MouseEvent; content: string }>();
  descriptionLeave = output<void>();

  bestCellStyle(row: ComparePropertyRow, index: number): string {
    return this.compareSpecs.bestCellStyle(row, index);
  }

  showDelta(row: ComparePropertyRow): boolean {
    return this.compareSpecs.shouldShowDeltaRow(row, this.baselineIndex());
  }

  rowDelta(row: ComparePropertyRow, index: number): CompareDeltaView | null {
    return this.compareSpecs.rowDelta(row, index, this.baselineIndex());
  }
}
