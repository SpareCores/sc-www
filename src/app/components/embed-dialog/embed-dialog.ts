import { isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { PrismHighlighter } from "../../services/prism-highlighter";
import { Button } from "../button/button";
import { Dropdown } from "../../directives/dropdown";
import { NumberStepper } from "../number-stepper/number-stepper";
import { EmbedChartOption, EmbedPreviewSize } from "./embed-dialog.types";
import { EMBED_PREVIEW_SIZES } from "./embed-dialog.constants";

@Component({
  selector: "sc-embed-dialog",
  imports: [Button, Dropdown, NumberStepper],
  templateUrl: "./embed-dialog.html",
  styleUrl: "./embed-dialog.css",
  host: {
    class: "block",
    "(window:resize)": "fitHeight()",
  },
})
export class EmbedDialog {
  private sanitizer = inject(DomSanitizer);
  private prismService = inject(PrismHighlighter);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  idPrefix = input.required<string>();
  captureEventPrefix = input.required<string>();
  charts = input.required<EmbedChartOption[]>();
  srcFor = input.required<(chartId: string) => string>();
  minHeight = input.required<number>();
  defaultHeight = input.required<number>();
  aspectRatio = input<number | null>(null);

  readonly previewSizes = EMBED_PREVIEW_SIZES;
  chartId = signal<string | null>(null);
  height = linkedSignal(() => this.defaultHeight());
  width = signal(100);
  previewSize = signal(EMBED_PREVIEW_SIZES[EMBED_PREVIEW_SIZES.length - 1]);
  previewMinHeight = linkedSignal<number, number>({
    source: this.height,
    computation: (height, previous) => Math.max(height, previous?.value ?? 0),
  });

  selectedChartName = computed(
    () =>
      this.charts().find((chart) => chart.id === this.chartId())?.name ??
      "Select a chart",
  );
  src = computed(() => {
    const chartId = this.chartId();
    return chartId ? this.srcFor()(chartId) : null;
  });
  safeSrc = computed(() => {
    const src = this.src();
    return src ? this.sanitizer.bypassSecurityTrustResourceUrl(src) : null;
  });
  iframeStyle = computed(
    () =>
      `height: ${this.height()}px; width: ${this.width()}%; border: 1px solid #34d399; border-radius: 8px; min-height: ${this.minHeight()}px`,
  );
  snippet = computed(
    () =>
      `<iframe \n src="${this.src()}" \n style="${this.iframeStyle()}">\n</iframe>`,
  );

  private codeBlock = viewChild<ElementRef<HTMLElement>>("codeBlock");
  private previewFrame =
    viewChild<ElementRef<HTMLIFrameElement>>("previewFrame");

  constructor() {
    afterRenderEffect(() => {
      const element = this.codeBlock()?.nativeElement;
      const snippet = this.snippet();
      if (element) {
        element.textContent = snippet;
        this.prismService.highlightElement(element);
      }
    });
    afterRenderEffect(() => {
      this.previewSize();
      this.fitHeight();
    });
  }

  selectPreviewSize(size: EmbedPreviewSize) {
    this.previewSize.set(size);
    this.height.set(this.defaultHeight());
    this.width.set(100);
  }

  fitHeight() {
    const frame = this.previewFrame()?.nativeElement;
    const ratio = this.aspectRatio();
    if (frame && ratio) {
      this.height.set(
        Math.max(this.minHeight(), Math.round(frame.offsetWidth * ratio)),
      );
    }
  }
}
