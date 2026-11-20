import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Button } from "../button/button";
import { ShareLink } from "../../services/share-link";

@Component({
  selector: "sc-share-link-button",
  imports: [Button],
  templateUrl: "./share-link-button.html",
  host: {
    class: "inline-flex",
  },
})
export class ShareLinkButton {
  private shareLink = inject(ShareLink);
  private copiedTimeout?: ReturnType<typeof setTimeout>;
  private readonly linkCopied = signal(false);

  buttonId = input<string | null>(null);

  protected readonly icon = computed(() =>
    this.linkCopied() ? "check" : "share-2",
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimeout));
  }

  protected copy(): void {
    void this.shareLink.copyCurrentUrl().then((copied) => {
      if (!copied) {
        return;
      }
      this.linkCopied.set(true);
      clearTimeout(this.copiedTimeout);
      this.copiedTimeout = setTimeout(() => this.linkCopied.set(false), 3000);
    });
  }
}
