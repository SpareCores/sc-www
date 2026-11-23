import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LucideCheck } from "@lucide/angular";

@Component({
  selector: "sc-check-list-item",
  imports: [LucideCheck],
  templateUrl: "./check-list-item.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "listitem",
    class:
      "flex items-center gap-2 pt-3 pb-3.75 text-sm text-gray-200 sm:text-2xl first:pt-0 last:pb-0",
  },
})
export class CheckListItem {}
