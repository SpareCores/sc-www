import { Component, input, output } from "@angular/core";
import { LucideChevronDown, LucideChevronUp } from "@lucide/angular";

export type AccordionItem = {
  title: string;
  content: string;
  html?: string;
  note?: string;
};

@Component({
  selector: "sc-accordion",
  imports: [LucideChevronDown, LucideChevronUp],
  templateUrl: "./accordion.html",
})
export class Accordion {
  heading = input("");
  items = input.required<AccordionItem[]>();
  activeIndex = input(-1);
  showHeading = input(true);
  useFaqSchema = input(false);

  activeIndexChange = output<number>();

  toggleItem(index: number) {
    const nextIndex = this.activeIndex() === index ? -1 : index;
    this.activeIndexChange.emit(nextIndex);
  }
}
