import { Component, ElementRef, input, output, viewChild } from "@angular/core";
import {
  ScrollbarMirrorController,
  ScrollbarMirrorState,
} from "../../pages/shared/compare-table/scrollbar-mirror.controller";

@Component({
  selector: "sc-scrollbar-mirror",
  templateUrl: "./scrollbar-mirror.html",
  styleUrl: "./scrollbar-mirror.css",
})
export class ScrollbarMirror {
  state = input.required<ScrollbarMirrorState>();
  scrolled = output<Event>();

  readonly element = viewChild<ElementRef<HTMLElement>>("mirror");
  readonly toStyle = ScrollbarMirrorController.toStyle;
}
