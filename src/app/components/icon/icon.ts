import { Component, input } from "@angular/core";
import { LucideDynamicIcon, LucideIconData } from "@lucide/angular";

@Component({
  selector: "app-icon",
  standalone: true,
  imports: [LucideDynamicIcon],
  host: {
    ngSkipHydration: "true",
    class: "inline-flex items-center justify-center",
  },
  template: `<svg [lucideIcon]="name()" [class]="iconClass()"></svg>`,
})
export class Icon {
  name = input.required<LucideIconData | string>();
  iconClass = input<string>("h-4 w-4");
}
