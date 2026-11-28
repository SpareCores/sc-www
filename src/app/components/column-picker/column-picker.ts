import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Dropdown } from "../../directives/dropdown";
import { TableColumn } from "../../tools/table-columns";
import { Button } from "../button/button";

export interface ColumnVisibilityChange {
  name: string;
  show: boolean;
}

@Component({
  selector: "sc-column-picker",
  imports: [Button, Dropdown],
  templateUrl: "./column-picker.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "inline-flex min-w-0",
  },
})
export class ColumnPicker {
  columns = input.required<readonly TableColumn[]>();
  buttonId = input("column_button");
  panelId = input("column_options");

  visibilityChange = output<ColumnVisibilityChange>();
}
