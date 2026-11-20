import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "sc-check-list",
  template: "<ng-content />",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "list",
    class: "flex flex-col divide-y divide-gray-400",
  },
})
export class CheckList {}
