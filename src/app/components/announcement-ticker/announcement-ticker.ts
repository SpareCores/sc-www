import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  ANNOUNCEMENT_TICKER_PALETTES,
  AnnouncementTickerMessage,
  DEFAULT_ANNOUNCEMENT_TICKER_DISMISS_LABEL,
  DEFAULT_ANNOUNCEMENT_TICKER_TONE,
} from "./announcement-ticker.constants";

@Component({
  selector: "app-announcement-ticker",
  imports: [RouterLink],
  templateUrl: "./announcement-ticker.html",
  styleUrl: "./announcement-ticker.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
})
export class AnnouncementTicker {
  readonly message = input.required<AnnouncementTickerMessage>();
  readonly dismissible = input(false);
  readonly dismissLabel = input(DEFAULT_ANNOUNCEMENT_TICKER_DISMISS_LABEL);
  readonly dismissed = output<void>();

  protected readonly copies = [0, 1] as const;

  protected readonly palette = computed(() => {
    return ANNOUNCEMENT_TICKER_PALETTES[
      this.message().tone ?? DEFAULT_ANNOUNCEMENT_TICKER_TONE
    ];
  });

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
