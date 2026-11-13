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
import { NumbersOnly } from "../../directives/numbers-only";
import { Stepper } from "../stepper/stepper";
import {
  EmbedWidgetOption,
  EmbedPreviewSize,
  EmbedStepper,
} from "./embed-dialog.types";
import { EMBED_PREVIEW_SIZES } from "./embed-dialog.constants";

@Component({
  selector: "sc-embed-dialog",
  imports: [Button, Dropdown, NumbersOnly, Stepper],
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
  widgets = input.required<EmbedWidgetOption[]>();
  srcFor = input.required<(widgetId: string) => string>();
  minHeight = input.required<number>();
  defaultHeight = input.required<number>();
  aspectRatio = input<number | null>(null);

  readonly previewSizes = EMBED_PREVIEW_SIZES;
  widgetId = signal<string | null>(null);
  height = linkedSignal(() => this.defaultHeight());
  width = signal(100);
  previewSize = signal(EMBED_PREVIEW_SIZES[EMBED_PREVIEW_SIZES.length - 1], {
    equal: () => false,
  });
  steppers = computed<EmbedStepper[]>(() => [
    {
      id: "height",
      label: "Height",
      unit: "px",
      min: this.minHeight(),
      max: 9999,
      step: 10,
      value: this.height,
    },
    {
      id: "width",
      label: "Width",
      unit: "%",
      min: 10,
      max: 100,
      step: 5,
      value: this.width,
    },
  ]);

  selectedWidgetName = computed(
    () =>
      this.widgets().find((widget) => widget.id === this.widgetId())?.name ??
      "Select a widget",
  );
  src = computed(() => {
    const widgetId = this.widgetId();
    return widgetId ? this.srcFor()(widgetId) : null;
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
      `<iframe \n title="${this.selectedWidgetName()}" \n src="${this.src()}" \n style="${this.iframeStyle()}">\n</iframe>`,
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

  stepperMaxDigits(stepper: EmbedStepper) {
    return String(stepper.max).length;
  }

  stepperInputWidth(stepper: EmbedStepper) {
    return this.stepperMaxDigits(stepper) + 0.5;
  }

  stepBy(stepper: EmbedStepper, direction: 1 | -1) {
    this.setClamped(stepper, stepper.value() + direction * stepper.step);
  }

  onStepperInput(stepper: EmbedStepper, event: Event) {
    const { value } = event.target as HTMLInputElement;
    const next = Number(value);
    if (value && next >= stepper.min && next <= stepper.max) {
      stepper.value.set(next);
    }
  }

  commitStepper(stepper: EmbedStepper, event: Event) {
    const field = event.target as HTMLInputElement;
    this.setClamped(
      stepper,
      field.value ? Number(field.value) : stepper.value(),
    );
    field.value = String(stepper.value());
  }

  private setClamped(stepper: EmbedStepper, next: number) {
    stepper.value.set(Math.min(stepper.max, Math.max(stepper.min, next)));
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
