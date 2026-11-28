import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from "@angular/core";
import { Dropdown } from "../../directives/dropdown";
import { DropdownPlacement } from "../../directives/dropdown-positions";
import { Button, ScButtonSize } from "../button/button";

@Component({
  selector: "sc-select-dropdown",
  imports: [Button, Dropdown],
  templateUrl: "./select-dropdown.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "inline-flex min-w-0 max-w-full",
  },
})
export class SelectDropdown<T> {
  options = input.required<readonly T[]>();
  selected = input.required<T>();
  label = input.required<string>();
  optionLabel = input<(option: T) => string>((option) => String(option));
  icon = input.required<string>();
  compactIcon = input<string | null>(null);
  buttonId = input.required<string>();
  panelId = input.required<string>();
  ariaLabel = input<string | null>(null);
  buttonClass = input("");
  size = input<ScButtonSize>("default");
  placement = input<DropdownPlacement>("bottom-end");
  flip = input(false);

  selectedChange = output<T>();

  private dropdown = viewChild.required(Dropdown);

  select(option: T) {
    this.selectedChange.emit(option);
    this.dropdown().hide();
  }
}
